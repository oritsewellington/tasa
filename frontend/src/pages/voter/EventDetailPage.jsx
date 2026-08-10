import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Crown,
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  ArrowRight,
  Trophy,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Star,
  Music,
  Shirt,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useGetEventQuery } from "../../store/api/eventsApi.js";
import { useGetCandidatesQuery } from "../../store/api/candidatesApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoriesApi.js";
import {
  getEventStatus,
  formatEventDate,
  isVotingOpen,
  rankCandidates,
  getTotalVotes,
  calcPercent,
} from "../../utils/helpers.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  CountdownTimer,
} from "../../components/ui/index.jsx";

const MEDALS = ["🥇", "🥈", "🥉"];
const CANDIDATES_PER_PAGE = 12;

// Icon + deep duotone gradient per category group — generates the hero
// banner without an image asset. Kept in sync with the same maps in
// HomePage.jsx / EventsPage.jsx; worth extracting to a shared util once
// every page has been redesigned.
const GROUP_ICONS = {
  Social: Users,
  Academic: BookOpen,
  Popularity: Star,
  Sports: Trophy,
  Leadership: Crown,
  Creative: Music,
  Fashion: Shirt,
  Business: Briefcase,
  General: Sparkles,
};

const BANNER_GRADIENTS = {
  Social: "from-indigo-950 via-indigo-900 to-ink-950",
  Academic: "from-violet-950 via-violet-900 to-ink-950",
  Popularity: "from-ember-900 via-ember-800 to-ink-950",
  Sports: "from-emerald-950 via-emerald-900 to-ink-950",
  Leadership: "from-rose-950 via-rose-900 to-ink-950",
  Creative: "from-fuchsia-950 via-pink-900 to-ink-950",
  Fashion: "from-purple-950 via-violet-900 to-ink-950",
  Business: "from-sky-950 via-indigo-900 to-ink-950",
  General: "from-orange-950 via-ember-800 to-ink-950",
};

// Same flagship-detection logic as the events list, kept in sync so a
// candidate lands on a detail page that matches the card they clicked from.
function isFlagshipEvent(event) {
  const name = (event.category || event.title || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "mr tasa" || name === "miss tasa";
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading: evLoading } = useGetEventQuery(eventId);
  const { data: candidates = [], isLoading: cLoading } =
    useGetCandidatesQuery(eventId);
  const { data: categories = [] } = useGetCategoriesQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const candidatesTopRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [eventId]);

  if (evLoading || cLoading) return <PageLoader />;

  if (!event)
    return (
      <div className="py-24 px-5 text-center">
        <p className="text-zinc-500 mb-4">Event not found.</p>
        <Link to="/events" className="btn-primary">
          Back to events
        </Link>
      </div>
    );

  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  const votingOpen = isVotingOpen(event);
  const ranked = rankCandidates(candidates);
  const totalVotes = getTotalVotes(candidates);
  const leaderVotes = ranked[0]?.totalVotes || 0;

  const isFlagship = isFlagshipEvent(event);
  const category = categories.find((c) => c._id === event.categoryId);

  const totalPages = Math.max(
    1,
    Math.ceil(ranked.length / CANDIDATES_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * CANDIDATES_PER_PAGE;
  const paginatedCandidates = ranked
    .map((candidate, idx) => ({ candidate, rank: idx + 1 }))
    .slice(startIdx, startIdx + CANDIDATES_PER_PAGE);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    candidatesTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="bg-zinc-50 min-h-screen animate-fade-in">
      {/* ── Hero: generated banner with overlaid title/badges ───────── */}
      <div className="relative bg-ink-950">
        <div className="relative w-full h-[52vw] max-h-[420px] min-h-[260px] overflow-hidden">
          <EventHero category={category} isFlagship={isFlagship} />
          {/* Scrim: strong at the bottom for text legibility, light at top
              so the back button/flagship tag stay readable. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        </div>

        <Link
          to="/events"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={14} /> Back to events
        </Link>

        {isFlagship && (
          <span className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1 px-3 py-1.5 rounded-full bg-ember-500/90 backdrop-blur-sm text-ink-950 text-xs font-bold shadow-sm">
            <Crown size={12} /> FLAGSHIP EVENT
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <div className="page-container pb-6 sm:pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <EventStatusBadge status={status} />
              {event.category && (
                <span className="badge-ember">{event.category}</span>
              )}
            </div>
            <h1 className="font-display text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold text-white leading-tight mb-1.5 drop-shadow-sm max-w-2xl">
              {event.title}
            </h1>
            {event.organization && (
              <p className="text-sm text-zinc-300">{event.organization}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Ticket-stub info card, overlapping the hero ─────────────── */}
      <div className="page-container relative z-10 -mt-6 sm:-mt-8 mb-2">
        <div className="card p-5 sm:p-6 shadow-card-hover">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <MetaItem
                icon={Calendar}
                label="Starts"
                value={formatEventDate(event.startDate)}
              />
              <MetaItem
                icon={Clock}
                label="Ends"
                value={formatEventDate(event.endDate)}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col bg-gradient-to-br from-ember-50 to-ember-100 border border-ember-200 rounded-2xl px-4 py-2.5">
                <span className="text-2xs font-semibold text-ember-800 uppercase tracking-wide">
                  Price per vote
                </span>
                <span className="text-xl font-extrabold text-ember-900 leading-tight">
                  ₦{(event.pricePerVote / 100).toLocaleString()}
                </span>
              </div>
              {votingOpen && (
                <div className="hidden sm:block">
                  <CountdownTimer
                    targetDate={event.endDate}
                    label="Closes in"
                  />
                </div>
              )}
            </div>
          </div>

          {votingOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-zinc-50">
              <CountdownTimer targetDate={event.endDate} label="Closes in" />
            </div>
          )}

          {event.description && (
            <p className="text-sm text-zinc-600 leading-relaxed mt-5 pt-5 border-t border-zinc-50">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Voting closed notice ─────────────────────────────────────── */}
      {!votingOpen && (
        <div className="page-container mt-5">
          <div
            className={`rounded-2xl px-5 py-3.5 text-sm font-semibold text-center border ${
              status === "upcoming"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {status === "upcoming"
              ? "⏳ Voting has not started yet. Check back soon!"
              : "🔒 This voting event is now closed."}
          </div>
        </div>
      )}

      {/* ── Candidates ───────────────────────────────────────────────── */}
      <div className="page-container py-10" ref={candidatesTopRef}>
        {ranked.length === 0 ? (
          <EmptyState
            icon={Crown}
            title="No candidates yet"
            description="Candidates will appear here once added by the organizer."
          />
        ) : (
          <>
            <div className="flex items-end justify-between flex-wrap gap-2 mb-1">
              <div>
                <h2 className="font-display text-xl font-extrabold text-zinc-900">
                  {ranked.length} Candidate{ranked.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Bars show position relative to the leader
                </p>
              </div>
            </div>

            {totalPages > 1 && (
              <p className="text-xs text-zinc-400 mb-4">
                Showing{" "}
                <span className="font-semibold text-zinc-600">
                  {startIdx + 1}–
                  {Math.min(startIdx + CANDIDATES_PER_PAGE, ranked.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-600">
                  {ranked.length}
                </span>
              </p>
            )}

            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${
                totalPages > 1 ? "" : "mt-2.5"
              }`}
            >
              {paginatedCandidates.map(({ candidate, rank }) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  rank={rank}
                  totalVotes={totalVotes}
                  leaderVotes={leaderVotes}
                  eventId={eventId}
                  isOpen={votingOpen}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}

            {totalVotes > 0 && (
              <div className="flex items-center gap-2.5 mt-6 px-4 py-3 bg-white rounded-xl border border-zinc-100">
                <Trophy size={15} className="text-ember-500 flex-shrink-0" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Progress bars show each candidate's votes relative to the
                  current leader. The leader always shows a full bar.
                  Percentages show share of total votes.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventHero({ category, isFlagship }) {
  if (isFlagship) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-[#171a22] to-ink-950 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-dots-flagship"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="#D9A441" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots-flagship)" />
        </svg>

        <div className="absolute -right-28 -top-28 w-[420px] h-[420px] rounded-full border border-ember-400/15" />
        <div className="absolute -right-16 -top-16 w-[320px] h-[320px] rounded-full border border-ember-400/10" />
        <span
          className="font-display absolute -bottom-16 -right-10 text-[220px] sm:text-[300px] font-extrabold leading-none text-white/[0.04] select-none"
          aria-hidden="true"
        >
          IX
        </span>
      </div>
    );
  }

  const Icon = GROUP_ICONS[category?.group] || Trophy;
  const gradient =
    BANNER_GRADIENTS[category?.group] || "from-ink-900 to-ink-950";

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} overflow-hidden`}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-dots-category"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.3" cy="1.3" r="1.3" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots-category)" />
      </svg>
      <Icon
        size={220}
        strokeWidth={1}
        className="absolute -right-14 -bottom-20 text-white/[0.07] rotate-[-10deg]"
      />
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-ember-50 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-ember-600" />
      </div>
      <div className="leading-tight">
        <p className="text-2xs text-zinc-400 font-medium">{label}</p>
        <p className="text-xs font-semibold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    for (const i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <nav
      aria-label="Candidates pagination"
      className="flex items-center justify-center gap-1.5 mt-8 flex-wrap"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-zinc-300 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-9 h-9 rounded-full text-sm font-medium border transition-all ${
              page === currentPage
                ? "bg-ember-500 text-white border-ember-500 shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50"
            }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function CandidateCard({
  candidate,
  rank,
  totalVotes,
  leaderVotes,
  eventId,
  isOpen,
}) {
  const [imgError, setImgError] = useState(false);

  const relPct =
    leaderVotes > 0
      ? Math.min(100, ((candidate.totalVotes || 0) / leaderVotes) * 100)
      : 0;
  const sharePct = calcPercent(candidate.totalVotes, totalVotes).toFixed(1);
  const isLeader = rank === 1 && (candidate.totalVotes || 0) > 0;

  const initials = (candidate.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const hasVotes = (candidate.totalVotes || 0) > 0;
  const showPhoto = candidate.photo && !imgError;

  return (
    <Link
      to={isOpen ? `/events/${eventId}/candidates/${candidate._id}` : "#"}
      className={`group block rounded-2xl overflow-hidden bg-white transition-all duration-200 ${
        isOpen
          ? "hover:-translate-y-1 hover:shadow-card-hover cursor-pointer"
          : "pointer-events-none opacity-80"
      } ${
        isLeader
          ? "border-2 border-ember-400 shadow-[0_4px_20px_rgba(217,164,65,0.18)]"
          : "border border-zinc-100 shadow-card"
      }`}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200">
        {showPhoto ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-[center_18%] transition-transform duration-300 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              {initials || <Crown size={22} />}
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2">
          {hasVotes &&
            (rank <= 3 ? (
              <span className="text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                {MEDALS[rank - 1]}
              </span>
            ) : (
              <span className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm text-2xs font-extrabold text-zinc-700 flex items-center justify-center shadow-sm">
                {rank}
              </span>
            ))}
        </div>

        <div className="absolute top-2 right-2 max-w-[45%] px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold truncate">
          {candidate.candidateCode ||
            "IX-" + String(candidate.candidateNumber).padStart(4, "0")}
        </div>

        <div className="absolute bottom-0 left-0 right-0 pt-8 pb-2.5 px-2.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent">
          <p className="text-white font-bold text-[13px] leading-snug line-clamp-2 drop-shadow-sm">
            {candidate.name}
          </p>
          {candidate.department && (
            <p className="text-white/65 text-[11px] mt-0.5 truncate">
              {candidate.department}
            </p>
          )}
          {candidate.level && (
            <p className="text-white/65 text-[11px] mt-0.5 truncate">
              {candidate.level}
            </p>
          )}
        </div>
      </div>

      <div className="px-2.5 pt-2.5 pb-3">
        <div className="flex items-center justify-end mb-1.5">
          <span className="text-xs font-bold text-ember-600">{sharePct}%</span>
        </div>

        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isLeader
                ? "bg-gradient-to-r from-ember-400 to-ember-600"
                : "bg-gradient-to-r from-zinc-300 to-zinc-400"
            }`}
            style={{ width: `${relPct}%` }}
          />
        </div>

        {isOpen ? (
          <p className="text-2xs text-ember-600 font-bold text-right flex items-center justify-end gap-1">
            Vote <ArrowRight size={11} />
          </p>
        ) : (
          <p className="text-2xs text-zinc-400 text-center">Voting closed</p>
        )}
      </div>
    </Link>
  );
}
