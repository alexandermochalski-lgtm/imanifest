import { seedUsers } from "@/lib/catalog";
import { opsUsers } from "@/lib/ops";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Course, Message, MessageKind } from "@/lib/types";

/** Peer DMs: 1 coin. Courses run 40–120+. Desk drip is 0.5. One coin stops spray without taxing a real thread. */
export const PEER_MESSAGE_COST = 1;

export type MessengerContact = {
  id: string;
  name: string;
  kind: MessageKind;
  subtitle: string;
  courseId?: string;
};

export function mentorContactId(courseId: string) {
  return `m-${courseId}`;
}

export function courseIdFromMentor(contactId: string) {
  return contactId.startsWith("m-") ? contactId.slice(2) : undefined;
}

export function normalizeMessage(message: Message): Message {
  return {
    ...message,
    toId: message.toId || "u-student",
    toName: message.toName || "You",
    kind: message.kind ?? "mentor",
    coinsSpent: message.coinsSpent ?? 0,
  };
}

export function counterpartId(message: Message, selfId: string) {
  const row = normalizeMessage(message);
  if (row.kind === "mentor" && row.courseId) return mentorContactId(row.courseId);
  if (row.fromId === selfId) return row.toId;
  if (row.toId === selfId) return row.fromId;
  return row.fromId;
}

export function threadMessages(messages: Message[], selfId: string, contactId: string) {
  return messages
    .map(normalizeMessage)
    .filter((message) => counterpartId(message, selfId) === contactId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function mentorContacts(courses: Course[], enrolledIds: string[]): MessengerContact[] {
  const enrolled = courses.filter((course) => enrolledIds.includes(course.id) && course.status === "active");
  return [
    {
      id: "u-faculty",
      name: "Dean Okonkwo",
      kind: "mentor" as const,
      subtitle: "Faculty lead · enrolled desks",
    },
    ...enrolled.map((course) => ({
      id: mentorContactId(course.id),
      name: "Dean Okonkwo",
      kind: "mentor" as const,
      subtitle: `${course.title} · ${course.faculty}`,
      courseId: course.id,
    })),
  ];
}

export function peerContacts(selfId: string): MessengerContact[] {
  return opsUsers
    .filter((user) => user.role === "student" && user.id !== selfId && user.status === "active")
    .map((user) => ({
      id: user.id,
      name: user.name,
      kind: "peer" as const,
      subtitle: user.bio,
    }));
}

export function findContact(id: string, courses: Course[], selfId: string): MessengerContact | undefined {
  const mentors = mentorContacts(courses, courses.map((course) => course.id));
  const found = [...mentors, ...peerContacts(selfId), facultyFallback()].find((item) => item.id === id);
  if (found) return found;
  const courseId = courseIdFromMentor(id);
  const course = courseId ? courses.find((item) => item.id === courseId) : undefined;
  if (course) {
    return {
      id,
      name: "Dean Okonkwo",
      kind: "mentor",
      subtitle: `${course.title} · ${course.faculty}`,
      courseId: course.id,
    };
  }
  const user = opsUsers.find((item) => item.id === id) ?? seedUsers.find((item) => item.id === id);
  if (!user || user.id === selfId) return undefined;
  return {
    id: user.id,
    name: user.name,
    kind: user.role === "student" ? "peer" : "mentor",
    subtitle: user.bio,
  };
}

function facultyFallback(): MessengerContact {
  return {
    id: "u-faculty",
    name: "Dean Okonkwo",
    kind: "mentor",
    subtitle: "Faculty lead",
  };
}

export function inboxThreads(messages: Message[], selfId: string, contacts: MessengerContact[], courses: Course[]) {
  const latest = new Map<string, Message>();
  for (const message of messages.map(normalizeMessage)) {
    const other = counterpartId(message, selfId);
    const current = latest.get(other);
    if (!current || current.createdAt <= message.createdAt) latest.set(other, message);
  }
  const fromContacts = contacts.map((contact) => ({
    contact,
    last: latest.get(contact.id),
  }));
  const extras = [...latest.entries()]
    .filter(([id]) => !contacts.some((contact) => contact.id === id))
    .map(([id, last]) => ({
      contact:
        findContact(id, courses, selfId) ??
        ({
          id,
          name: last.fromId === selfId ? last.toName : last.fromName,
          kind: last.kind,
          subtitle: last.kind === "mentor" ? "Mentor" : "Student",
          courseId: last.courseId,
        } satisfies MessengerContact),
      last,
    }));
  return [...fromContacts, ...extras].sort((a, b) => {
    const aTime = a.last?.createdAt ?? "";
    const bTime = b.last?.createdAt ?? "";
    if (aTime === bTime) return a.contact.kind === "mentor" ? -1 : 1;
    return aTime < bTime ? 1 : -1;
  });
}

type RemoteRow = {
  id: string;
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
  kind: MessageKind;
  course_id: string | null;
  coins_spent: number;
  body: string;
  created_at: string;
};

function fromRemote(row: RemoteRow): Message {
  return {
    id: row.id,
    fromId: row.from_id,
    fromName: row.from_name,
    toId: row.to_id,
    toName: row.to_name,
    kind: row.kind,
    courseId: row.course_id ?? undefined,
    coinsSpent: Number(row.coins_spent) || 0,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function messageClient() {
  return createAdminSupabase() ?? (await createServerSupabase());
}

export async function persistRemoteMessage(message: Message) {
  const client = await messageClient();
  if (!client) return;
  await client.from("campus_messages").upsert({
    id: message.id,
    from_id: message.fromId,
    from_name: message.fromName,
    to_id: message.toId,
    to_name: message.toName,
    kind: message.kind,
    course_id: message.courseId ?? null,
    coins_spent: message.coinsSpent,
    body: message.body,
    created_at: message.createdAt,
  });
}

export async function loadRemoteMessages(userId: string): Promise<Message[]> {
  const client = await messageClient();
  if (!client) return [];
  const { data: sent } = await client.from("campus_messages").select("*").eq("from_id", userId);
  const { data: received } = await client.from("campus_messages").select("*").eq("to_id", userId);
  const rows = [...((sent ?? []) as RemoteRow[]), ...((received ?? []) as RemoteRow[])];
  const unique = new Map(rows.map((row) => [row.id, fromRemote(row)]));
  return [...unique.values()];
}

export function mergeMessages(local: Message[], remote: Message[]) {
  const unique = new Map<string, Message>();
  for (const message of [...local, ...remote].map(normalizeMessage)) unique.set(message.id, message);
  return [...unique.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
