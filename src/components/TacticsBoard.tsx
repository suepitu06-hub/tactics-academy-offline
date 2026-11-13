import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDownToLine, ArrowUpRight, Eraser, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORMATIONS } from "@/data/formations";
import { getDB, type TacticalBoardRecord } from "@/database/db";

type Team = "home" | "away";
type Tool = "select" | "pass" | "run";
type BoardPlayer = TacticalBoardRecord["players"][number];
type BoardArrow = TacticalBoardRecord["arrows"][number];

function makeTeam(formationId: string, team: Team): BoardPlayer[] {
  const formation = FORMATIONS.find((item) => item.id === formationId) ?? FORMATIONS[0];
  return formation.players.map((player, index) => ({
    id: `${team}-${index}`,
    role: player.role,
    x: player.x,
    y: team === "home" ? player.y : 100 - player.y,
    team,
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TacticalPitch({
  players,
  arrows,
  tool,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPlayerPointerDown,
}: {
  players: BoardPlayer[];
  arrows: BoardArrow[];
  tool: Tool;
  onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: () => void;
  onPlayerPointerDown: (event: React.PointerEvent<SVGGElement>, player: BoardPlayer) => void;
}) {
  const pitchRef = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={pitchRef}
      viewBox="0 0 100 150"
      role="img"
      aria-label="Interactive football tactics pitch"
      className={`mx-auto block w-full max-w-[420px] touch-none select-none ${tool === "select" ? "cursor-grab" : "cursor-crosshair"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <defs>
        <pattern id="board-stripes" width="100" height="20" patternUnits="userSpaceOnUse">
          <rect width="100" height="20" fill="var(--color-pitch)" />
          <rect width="100" height="10" fill="var(--color-pitch-line)" opacity="0.06" />
        </pattern>
        <marker id="board-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
        </marker>
      </defs>

      <rect width="100" height="150" rx="3" fill="url(#board-stripes)" />
      <g fill="none" stroke="var(--color-pitch-line)" strokeWidth="0.55" opacity="0.9">
        <rect x="3" y="3" width="94" height="144" />
        <line x1="3" y1="75" x2="97" y2="75" />
        <circle cx="50" cy="75" r="10" />
        <circle cx="50" cy="75" r="0.8" fill="var(--color-pitch-line)" />
        <rect x="22" y="3" width="56" height="17" />
        <rect x="36" y="3" width="28" height="7" />
        <rect x="22" y="130" width="56" height="17" />
        <rect x="36" y="140" width="28" height="7" />
        <path d="M 32 20 A 18 18 0 0 0 68 20" />
        <path d="M 32 130 A 18 18 0 0 1 68 130" />
      </g>

      {arrows.map((arrow) => (
        <line
          key={arrow.id}
          x1={4 + arrow.x1 * 0.92}
          y1={5 + arrow.y1 * 1.4}
          x2={4 + arrow.x2 * 0.92}
          y2={5 + arrow.y2 * 1.4}
          stroke={arrow.kind === "pass" ? "var(--color-accent)" : "var(--color-team-away)"}
          strokeWidth="1.1"
          strokeDasharray={arrow.kind === "pass" ? "2 1.5" : undefined}
          markerEnd="url(#board-arrow)"
          opacity="0.95"
          pointerEvents="none"
        />
      ))}

      {players.map((player, index) => {
        const x = 4 + player.x * 0.92;
        const y = 5 + player.y * 1.4;
        const isGoalkeeper = player.role === "GK";
        return (
          <g
            key={player.id}
            role="button"
            aria-label={`${player.team === "home" ? "Home" : "Away"} ${player.role}`}
            tabIndex={0}
            onPointerDown={(event) => onPlayerPointerDown(event, player)}
            className="cursor-grab"
            style={{ animation: `fade-in 0.25s ease ${index * 0.01}s both` }}
          >
            <circle cx={x} cy={y} r="5.3" fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r="3.5"
              fill={isGoalkeeper ? "var(--color-accent)" : player.team === "home" ? "var(--color-primary)" : "var(--color-team-away)"}
              stroke="var(--color-pitch-line)"
              strokeWidth="0.55"
            />
            <text
              x={x}
              y={y + 0.95}
              textAnchor="middle"
              fontSize="2.35"
              fontWeight="700"
              fill={isGoalkeeper ? "var(--color-accent-foreground)" : player.team === "home" ? "var(--color-primary-foreground)" : "var(--color-team-away-foreground)"}
              pointerEvents="none"
            >
              {player.role}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function TacticsBoard() {
  const db = getDB();
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [awayFormation, setAwayFormation] = useState("4-4-2");
  const [players, setPlayers] = useState<BoardPlayer[]>(() => [
    ...makeTeam("4-3-3", "home"),
    ...makeTeam("4-4-2", "away"),
  ]);
  const [arrows, setArrows] = useState<BoardArrow[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [name, setName] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draftArrow, setDraftArrow] = useState<BoardArrow | null>(null);
  const [notice, setNotice] = useState("");
  const savedBoards = useLiveQuery(
    () => (db ? db.tactics.orderBy("updatedAt").reverse().toArray() : Promise.resolve([])),
    [],
    [] as TacticalBoardRecord[],
  );

  const allArrows = draftArrow ? [...arrows, draftArrow] : arrows;

  function toPitch(event: React.PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - bounds.left) / bounds.width) * 100;
    const py = ((event.clientY - bounds.top) / bounds.height) * 150;
    return {
      x: clamp((px - 4) / 0.92, 0, 100),
      y: clamp((py - 5) / 1.4, 0, 100),
    };
  }

  function setFormation(team: Team, formationId: string) {
    if (team === "home") setHomeFormation(formationId);
    else setAwayFormation(formationId);
    setPlayers((current) => [...current.filter((player) => player.team !== team), ...makeTeam(formationId, team)]);
    setArrows([]);
    setDraftArrow(null);
  }

  function startDrawing(event: React.PointerEvent<SVGSVGElement>, point?: { x: number; y: number }) {
    if (tool === "select") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = point ?? toPitch(event);
    setDraftArrow({ id: `arrow-${Date.now()}`, kind: tool, x1: start.x, y1: start.y, x2: start.x, y2: start.y });
  }

  function handlePitchDown(event: React.PointerEvent<SVGSVGElement>) {
    if (tool !== "select") startDrawing(event);
  }

  function handlePitchMove(event: React.PointerEvent<SVGSVGElement>) {
    if (draggingId) {
      const point = toPitch(event);
      setPlayers((current) => current.map((player) => player.id === draggingId ? { ...player, ...point } : player));
    }
    if (draftArrow) {
      const point = toPitch(event);
      setDraftArrow((current) => current ? { ...current, ...{ x2: point.x, y2: point.y } } : null);
    }
  }

  function finishGesture() {
    setDraggingId(null);
    setDraftArrow((current) => {
      if (current && Math.hypot(current.x2 - current.x1, current.y2 - current.y1) > 3) {
        setArrows((previous) => [...previous, current]);
      }
      return null;
    });
  }

  async function saveBoard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) {
      setNotice("Local storage is unavailable on this device.");
      return;
    }
    const boardName = name.trim() || `Tactic ${savedBoards.length + 1}`;
    try {
      await db.tactics.add({ name: boardName, homeFormation, awayFormation, players, arrows, updatedAt: Date.now() });
      setName("");
      setNotice(`“${boardName}” saved on this device.`);
    } catch {
      setNotice("Could not save this tactic. Please try again.");
    }
  }

  function loadBoard(board: TacticalBoardRecord) {
    setHomeFormation(board.homeFormation);
    setAwayFormation(board.awayFormation);
    setPlayers(board.players);
    setArrows(board.arrows);
    setNotice(`Loaded “${board.name}”.`);
  }

  async function deleteBoard(board: TacticalBoardRecord) {
    if (db && board.id !== undefined) await db.tactics.delete(board.id);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(["home", "away"] as Team[]).map((team) => {
          const current = team === "home" ? homeFormation : awayFormation;
          return (
            <label key={team} className="min-w-0 space-y-1.5 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 capitalize">
                <span className={`h-2.5 w-2.5 rounded-full ${team === "home" ? "bg-primary" : "bg-team-away"}`} />
                {team} team
              </span>
              <select
                aria-label={`${team} team formation`}
                value={current}
                onChange={(event) => setFormation(team, event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {FORMATIONS.map((formation) => <option key={formation.id} value={formation.id}>{formation.name}</option>)}
              </select>
            </label>
          );
        })}
      </div>

      <div className="card-soft overflow-hidden p-2 sm:p-3">
        <TacticalPitch
          players={players}
          arrows={allArrows}
          tool={tool}
          onPointerDown={handlePitchDown}
          onPointerMove={handlePitchMove}
          onPointerUp={finishGesture}
          onPlayerPointerDown={(event, player) => {
            event.stopPropagation();
            event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
            if (tool === "select") setDraggingId(player.id);
            else startDrawing(event as unknown as React.PointerEvent<SVGSVGElement>, { x: player.x, y: player.y });
          }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2" aria-label="Drawing tools">
        {([
          ["select", "Move", Users],
          ["pass", "Pass", ArrowUpRight],
          ["run", "Run", ArrowDownToLine],
        ] as const).map(([id, label, Icon]) => (
          <Button
            key={id}
            type="button"
            variant={tool === id ? "default" : "outline"}
            className="h-11 px-2 text-xs"
            aria-pressed={tool === id}
            onClick={() => setTool(id)}
          >
            <Icon />{label}
          </Button>
        ))}
        <Button type="button" variant="outline" className="h-11 px-2 text-xs" onClick={() => { setArrows([]); setDraftArrow(null); }} disabled={arrows.length === 0} aria-label="Clear all arrows">
          <Eraser />Clear
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {tool === "select" ? "Drag players to adjust their positions." : `Draw a ${tool === "pass" ? "passing line" : "movement run"} across the pitch.`}
        {" "}{players.length} players
      </p>

      <section className="space-y-3 border-t border-border pt-4">
        <h2 className="flex items-center gap-2 text-sm font-bold"><Users size={16} /> Save this tactic</h2>
        <form onSubmit={saveBoard} className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Tactic name"
            placeholder="Name your tactic"
            maxLength={40}
            className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" className="h-11 shrink-0 px-4">Save</Button>
        </form>
        <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">{notice}</p>
      </section>

      <section className="space-y-2 border-t border-border pt-4">
        <h2 className="text-sm font-bold">Saved tactics <span className="font-normal text-muted-foreground">{savedBoards.length}</span></h2>
        {savedBoards.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No saved tactics yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {savedBoards.map((board) => (
              <li key={board.id ?? board.updatedAt} className="flex items-center gap-2 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{board.name}</span>
                <span className="text-xs text-muted-foreground">{board.homeFormation} / {board.awayFormation}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => loadBoard(board)}>Load</Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${board.name}`} onClick={() => void deleteBoard(board)}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}