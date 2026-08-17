import { cookies } from "next/headers";
import type { CampusState } from "@/lib/types";

const STATE_COOKIE = "imu_state";

export function emptyState(): CampusState {
  return {
    coins: 500,
    enrollments: ["c-mindset"],
    completedModules: [],
    quizResults: [],
    favoriteBooks: [],
    favoriteJobs: [],
    favoriteJournals: [],
    favoriteBundles: [],
    likedForum: [],
    applications: [],
    journals: [],
    forumPosts: [],
    messages: [
      {
        id: "msg-welcome",
        fromId: "u-faculty",
        fromName: "Dean Okonkwo",
        toId: "u-student",
        toName: "Alex Operator",
        kind: "mentor",
        courseId: "c-mindset",
        coinsSpent: 0,
        body: "Welcome to campus. Start Sovereign Mindset — it is already on your ledger at zero coins. Message me from that course whenever the method stalls.",
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ],
    notifications: [
      {
        id: "n-login",
        title: "Login award",
        body: "500 campus coins credited so you can enroll and test checkout.",
        read: false,
        href: "/pricing",
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ],
    streakCount: 0,
    lastDeskDate: "",
    membershipPaidAt: "",
    profile: {
      name: "",
      phone: "",
      bio: "",
    },
  };
}

export async function getState(): Promise<CampusState> {
  const raw = (await cookies()).get(STATE_COOKIE)?.value;
  if (!raw) return emptyState();
  try {
    return { ...emptyState(), ...(JSON.parse(raw) as CampusState) };
  } catch {
    return emptyState();
  }
}

export async function saveState(state: CampusState) {
  (await cookies()).set(STATE_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function mutateState(mutator: (state: CampusState) => CampusState) {
  const next = mutator(await getState());
  await saveState(next);
  return next;
}

export function notify(
  state: CampusState,
  title: string,
  body: string,
  href: string,
): CampusState {
  return {
    ...state,
    notifications: [
      {
        id: `n-${Date.now()}`,
        title,
        body,
        read: false,
        href,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...state.notifications,
    ].slice(0, 20),
  };
}
