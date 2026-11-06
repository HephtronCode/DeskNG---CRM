import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Ticket } from "../models/Ticket.js";
import { TicketMessage } from "../models/TicketMessage.js";
import { Counter } from "../models/Counter.js";
import { getNextTicketNumber } from "../models/Counter.js";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const hoursAgo = (hours) => new Date(Date.now() - hours * HOUR);
const minutesAfter = (base, minutes) =>
  new Date(base.getTime() + minutes * MINUTE);

const CATEGORIES = [
  {
    name: "Settlements and Disputes",
    code: "SET",
    description:
      "Delayed merchant payouts, card chargebacks, and transfer " +
      "reconciliation failures.",
    subcategories: [
      "Uncredited Transfer",
      "Chargeback Claim",
      "Delayed Batch Settlement",
      "Excess Fee Deduction",
    ],
    defaultPriority: "high",
    slaHours: 12,
  },
  {
    name: "POS and Terminal Hardware",
    code: "POS",
    description:
      "Device tamper alerts, printer hardware errors, and SIM " +
      "network connectivity faults.",
    subcategories: [
      "Terminal Tamper Lock",
      "Network SIM Connectivity",
      "Printer Roller Fault",
      "Power Failure",
    ],
    defaultPriority: "critical",
    slaHours: 4,
  },
  {
    name: "KYC and Compliance",
    code: "KYC",
    description:
      "Business registration validation, mandate updates, and " +
      "tier upgrade verification.",
    subcategories: [
      "CAC Document Rejection",
      "Director BVN Verification",
      "Tier Limit Extension",
      "Address Revalidation",
    ],
    defaultPriority: "medium",
    slaHours: 24,
  },
  {
    name: "General Inquiries",
    code: "GEN",
    description:
      "Merchant onboarding guidance, transaction fee schedules, " +
      "and portal navigation.",
    subcategories: [
      "Tariff Clarification",
      "Portal Access Help",
      "Statement Export",
    ],
    defaultPriority: "low",
    slaHours: 48,
  },
  {
    name: "API and Webhook Integration",
    code: "API",
    description:
      "Checkout SDK errors, webhook delivery failures, NIP " +
      "transfer API timeouts, and live key rotation.",
    subcategories: [
      "Webhook Delivery Failure",
      "API Key Rotation",
      "NIP Transfer Timeout",
      "Checkout Widget Error",
    ],
    defaultPriority: "high",
    slaHours: 8,
  },
  {
    name: "Fraud and Risk Monitoring",
    code: "FRD",
    description:
      "Flagged suspicious transactions, account lien inquiries, " +
      "velocity rule triggers, and CBN compliance holds.",
    subcategories: [
      "Account Lien Release",
      "Suspicious Transaction Alert",
      "Velocity Limit Trigger",
      "CBN Watchlist Review",
    ],
    defaultPriority: "critical",
    slaHours: 4,
  },
  {
    name: "Virtual Accounts and Collections",
    code: "VAC",
    description:
      "Dedicated NUBAN provisioning issues, delayed NIP inward " +
      "notifications, and dynamic account expiry faults.",
    subcategories: [
      "NUBAN Provisioning Error",
      "Missing Inward NIP Credit",
      "Dynamic Account Expiry",
      "Split Settlement Config",
    ],
    defaultPriority: "high",
    slaHours: 6,
  },
  {
    name: "Card and USSD Channels",
    code: "CHN",
    description:
      "USSD session drops, card funding reversals, and " +
      "Verve/Mastercard decline troubleshooting.",
    subcategories: [
      "USSD Session Timeout",
      "Card Funding Reversal",
      "Verve Tokenization Issue",
      "PIN Reset Failure",
    ],
    defaultPriority: "medium",
    slaHours: 16,
  },
];

const USERS = [
  {
    name: "Babatunde Yahaya",
    email: "admin@desk.ng",
    password: "Password123!",
    role: "admin",
    department: "Operations Leadership",
  },
  {
    name: "Ngozi Eze",
    email: "ngozi.eze@desk.ng",
    password: "Password123!",
    role: "admin",
    department: "Compliance and Risk Oversight",
  },
  {
    name: "Chioma Okonkwo",
    email: "chioma.okonkwo@desk.ng",
    password: "Password123!",
    role: "agent",
    department: "Merchant Support Tier 1",
  },
  {
    name: "Femi Adeleke",
    email: "femi.adeleke@desk.ng",
    password: "Password123!",
    role: "agent",
    department: "Technical Ops Tier 2",
  },
  {
    name: "Ibrahim Musa",
    email: "ibrahim.musa@desk.ng",
    password: "Password123!",
    role: "agent",
    department: "Settlements and Reconciliation",
  },
  {
    name: "Toluwani Adeyemi",
    email: "toluwani.adeyemi@desk.ng",
    password: "Password123!",
    role: "agent",
    department: "POS Field Engineering",
  },
  {
    name: "Zainab Danjuma",
    email: "zainab.danjuma@desk.ng",
    password: "Password123!",
    role: "agent",
    department: "KYC and Onboarding Desk",
  },
  {
    name: "Amina Bello",
    email: "amina@konga-logistics.ng",
    password: "Password123!",
    role: "customer",
    department: "Logistics and Procurement",
  },
  {
    name: "Chinedu Okafor",
    email: "chinedu@slot-retail.ng",
    password: "Password123!",
    role: "customer",
    department: "Retail Branch Operations",
  },
  {
    name: "Oluwaseun Balogun",
    email: "seun@chowdeck-merchants.ng",
    password: "Password123!",
    role: "customer",
    department: "Finance and Treasury",
  },
  {
    name: "Halima Abdullahi",
    email: "halima@medplus-pharmacy.ng",
    password: "Password123!",
    role: "customer",
    department: "Store Reconciliation",
  },
  {
    name: "Emeka Nwosu",
    email: "emeka@guotransport.ng",
    password: "Password123!",
    role: "customer",
    department: "Ticketing and Collections",
  },
];

// Upsert a category by its unique code to preserve ObjectIds
// across seed re-runs (keeps saved Postman requests valid).
const upsertCategory = async (category) => {
  const { code, ...fields } = category;
  return Category.findOneAndUpdate(
    { code },
    { $set: fields },
    { returnDocument: "after", upsert: true },
  );
};

// Upsert a user by email. Existing accounts keep their hashed
// password and _id; only profile fields are refreshed.
const upsertUser = async (user) => {
  const existing = await User.findOne({ email: user.email });

  if (existing) {
    existing.name = user.name;
    existing.role = user.role;
    existing.department = user.department;
    existing.isActive = true;
    return existing.save();
  }

  return User.create(user);
};

// t.created: hours ago the ticket was opened
// t.closed / t.archived: hours ago those stamps occurred
const TICKETS = [
  {
    subject: "POS terminal tamper lock at Ikeja branch",
    description:
      "Terminal 2034 shows a tamper lock and refuses all " +
      "transactions since this morning.",
    type: "incident",
    priority: "critical",
    catCode: "POS",
    subcategory: "Terminal Tamper Lock",
    requesterEmail: "chinedu@slot-retail.ng",
    assigneeEmail: "toluwani.adeyemi@desk.ng",
    status: "open",
    created: 5,
  },
  {
    subject: "Uncredited NIP transfer of NGN 450,000",
    description:
      "Payout to settlement account not credited 30 hours " +
      "after NIP session was successful.",
    type: "incident",
    priority: "high",
    catCode: "SET",
    subcategory: "Uncredited Transfer",
    requesterEmail: "amina@konga-logistics.ng",
    assigneeEmail: "ibrahim.musa@desk.ng",
    status: "on_hold",
    created: 30,
  },
  {
    subject: "Repeated webhook delivery failures on checkout",
    description:
      "Webhook endpoint returned 504 for 14 consecutive " +
      "attempts from 03:00–05:00.",
    type: "incident",
    priority: "high",
    catCode: "API",
    subcategory: "Webhook Delivery Failure",
    requesterEmail: "seun@chowdeck-merchants.ng",
    assigneeEmail: "femi.adeleke@desk.ng",
    status: "escalated",
    escalationReason:
      "Requires Tier-2 engineering investigation into " +
      "gateway timeout logs.",
    created: 72,
  },
  {
    subject: "CAC document rejection on merchant onboarding",
    description:
      "CAC certificate rejected twice despite valid " +
      "registration details.",
    type: "service_request",
    priority: "medium",
    catCode: "KYC",
    subcategory: "CAC Document Rejection",
    requesterEmail: "halima@medplus-pharmacy.ng",
    assigneeEmail: "zainab.danjuma@desk.ng",
    status: "closed",
    created: 120,
    closed: 24,
  },
  {
    subject: "Delayed batch settlement for settlement batch",
    description:
      "Batch SET-7781 from two days ago still shows as " +
      "pending in the portal.",
    type: "complaint",
    priority: "high",
    catCode: "SET",
    subcategory: "Delayed Batch Settlement",
    requesterEmail: "emeka@guotransport.ng",
    assigneeEmail: "ibrahim.musa@desk.ng",
    status: "closed",
    created: 96,
    closed: 48,
  },
  {
    subject: "USSD session keeps timing out at PIN stage",
    description:
      "Session drops at PIN entry on both Glo and MTN " +
      "lines.",
    type: "inquiry",
    priority: "low",
    catCode: "CHN",
    subcategory: "USSD Session Timeout",
    requesterEmail: "amina@konga-logistics.ng",
    status: "open",
    created: 2,
  },
  {
    subject: "Account lien release request for flagged payout",
    description:
      "Payout account under lien after suspicious alert; " +
      "funds are verified legitimate.",
    type: "incident",
    priority: "critical",
    catCode: "FRD",
    subcategory: "Account Lien Release",
    requesterEmail: "seun@chowdeck-merchants.ng",
    assigneeEmail: "ngozi.eze@desk.ng",
    status: "on_hold",
    created: 12,
  },
  {
    subject: "NUBAN provisioning error for new virtual account",
    description:
      "NUBAN returned for collection account but cannot " +
      "receive inward NIP credits.",
    type: "incident",
    priority: "high",
    catCode: "VAC",
    subcategory: "NUBAN Provisioning Error",
    requesterEmail: "chinedu@slot-retail.ng",
    assigneeEmail: "femi.adeleke@desk.ng",
    status: "open",
    created: 8,
  },
  {
    subject: "PIN reset failure for corporate pay card",
    description:
      "Card blocked after three failed PIN reset attempts; " +
      "customer at branch counter.",
    type: "complaint",
    priority: "medium",
    catCode: "CHN",
    subcategory: "PIN Reset Failure",
    requesterEmail: "halima@medplus-pharmacy.ng",
    status: "escalated",
    escalationReason:
      "PIN reset tooling unavailable to Tier-1; needs " +
      "issuer backend access.",
    created: 50,
  },
  {
    subject: "Tariff clarification for bulk transfers",
    description:
      "Request for current fee schedule for NIP bulk " +
      "transfer pricing tiers.",
    type: "inquiry",
    priority: "low",
    catCode: "GEN",
    subcategory: "Tariff Clarification",
    requesterEmail: "emeka@guotransport.ng",
    status: "closed",
    created: 200,
    closed: 150,
  },
  {
    subject: "Missing inward NIP credit on collections account",
    description:
      "Family of 12 NIP credits posted late; one missing " +
      "inward credit of NGN 120,000.",
    type: "incident",
    priority: "high",
    catCode: "VAC",
    subcategory: "Missing Inward NIP Credit",
    requesterEmail: "amina@konga-logistics.ng",
    assigneeEmail: "ibrahim.musa@desk.ng",
    status: "archived",
    created: 400,
    closed: 200,
    archived: 100,
  },
  {
    subject: "Printer roller fault on POS terminal 1120",
    description:
      "Receipts print blank after roller replacement last " +
      "week.",
    type: "service_request",
    priority: "medium",
    catCode: "POS",
    subcategory: "Printer Roller Fault",
    requesterEmail: "chinedu@slot-retail.ng",
    assigneeEmail: "toluwani.adeyemi@desk.ng",
    status: "archived",
    created: 300,
    closed: 150,
    archived: 50,
  },
];

// Messages keyed by ticket index; afterMinutes is relative to
// the ticket createdAt.
const MESSAGES = {
  0: [
    {
      from: "chinedu@slot-retail.ng",
      body: "Attached device logs from terminal 2034 for your " +
        "review.",
      afterMinutes: 60,
    },
    {
      from: "toluwani.adeyemi@desk.ng",
      body: "Field engineering has been dispatched to the " +
        "branch.",
      internal: true,
      afterMinutes: 120,
    },
  ],
  1: [
    {
      from: "ibrahim.musa@desk.ng",
      body: "NIBSS trace initiated; bank confirmation pending.",
      internal: true,
      afterMinutes: 180,
    },
    {
      from: "ibrahim.musa@desk.ng",
      body: "We are tracing the transfer with the sending " +
        "bank and will update you.",
      afterMinutes: 300,
    },
  ],
  2: [
    {
      from: "femi.adeleke@desk.ng",
      body: "Logs show 504s from the webhook endpoint; " +
        "gateway pool exhausted.",
      internal: true,
      afterMinutes: 60,
    },
    {
      from: "femi.adeleke@desk.ng",
      body: "Our API team is investigating the delivery " +
        "failure now.",
      afterMinutes: 240,
    },
  ],
  3: [
    {
      from: "zainab.danjuma@desk.ng",
      body: "Your CAC documents are approved and the account " +
        "tier has been upgraded.",
      afterMinutes: 1200,
    },
    {
      from: "halima@medplus-pharmacy.ng",
      body: "Thank you, everything works now.",
      afterMinutes: 1560,
    },
  ],
  4: [
    {
      from: "ibrahim.musa@desk.ng",
      body: "Batch SET-7781 settled early this morning; the " +
        "portal now reflects it.",
      afterMinutes: 600,
    },
  ],
  5: [
    {
      from: "amina@konga-logistics.ng",
      body: "The timeout also happens on the merchant test " +
        "line.",
      afterMinutes: 30,
    },
  ],
  6: [
    {
      from: "ngozi.eze@desk.ng",
      body: "Risk team reviewing the flagged transaction " +
        "pattern before lien release.",
      internal: true,
      afterMinutes: 120,
    },
  ],
  7: [
    {
      from: "femi.adeleke@desk.ng",
      body: "Provisioning job failed; retrying on the core " +
        "switch.",
      internal: true,
      afterMinutes: 60,
    },
  ],
  8: [
    {
      from: "zainab.danjuma@desk.ng",
      body: "Please confirm the last four digits of the " +
        "card for verification.",
      afterMinutes: 120,
    },
  ],
  9: [
    {
      from: "chioma.okonkwo@desk.ng",
      body: "Current NIP bulk transfer rates are published in " +
        "the March fee schedule.",
      afterMinutes: 600,
    },
  ],
  10: [
    {
      from: "ibrahim.musa@desk.ng",
      body: "Credited manually; posting completed on the " +
        "account.",
      internal: true,
      afterMinutes: 300,
    },
    {
      from: "ibrahim.musa@desk.ng",
      body: "Your account has been credited with the full " +
        "amount.",
      afterMinutes: 480,
    },
  ],
  11: [
    {
      from: "toluwani.adeyemi@desk.ng",
      body: "Field engineer replaced the printer roller; " +
        "receipts printing correctly.",
      afterMinutes: 360,
    },
  ],
};

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.MONGO_URI);

    // Wipe prior ticket data; keep counters reset for a clean
    // sequence (seeded tickets consume TKT-1001 onward).
    await Ticket.deleteMany({});
    await TicketMessage.deleteMany({});
    await Counter.deleteMany({});
    await Counter.create({ _id: "ticket_seq", seq: 1000 });
    console.log("Cleared tickets, messages, and counters.");

    const categoryIds = {};
    const categorySla = {};
    for (const category of CATEGORIES) {
      const saved = await upsertCategory(category);
      categoryIds[saved.code] = saved._id;
      categorySla[saved.code] = saved.slaHours;
    }
    console.log(`Upserted ${CATEGORIES.length} categories.`);

    const userIds = {};
    for (const user of USERS) {
      const saved = await upsertUser(user);
      userIds[saved.email] = saved._id;
    }
    console.log(`Upserted ${USERS.length} users.`);

    const tickets = [];
    for (const t of TICKETS) {
      const createdAt = hoursAgo(t.created);
      const slaHours = categorySla[t.catCode] || 24;
      const doc = {
        ticketNumber: await getNextTicketNumber("TKT"),
        subject: t.subject,
        description: t.description,
        type: t.type,
        priority: t.priority,
        category: categoryIds[t.catCode],
        subcategory: t.subcategory,
        requester: userIds[t.requesterEmail],
        status: t.status,
        createdAt,
        updatedAt: createdAt,
        dueAt: new Date(createdAt.getTime() + slaHours * HOUR),
      };

      if (t.assigneeEmail) {
        doc.assignedTo = userIds[t.assigneeEmail];
      }
      if (t.status === "escalated") {
        doc.escalationReason = t.escalationReason;
      }
      if (t.closed) {
        doc.closedAt = hoursAgo(t.closed);
      }
      if (t.archived) {
        doc.archivedAt = hoursAgo(t.archived);
      }

      tickets.push(await Ticket.create(doc));
    }
    console.log(`Seeded ${tickets.length} tickets.`);

    let messageCount = 0;
    for (let i = 0; i < tickets.length; i += 1) {
      const messages = MESSAGES[i] || [];
      for (const m of messages) {
        await TicketMessage.create({
          ticket: tickets[i]._id,
          sender: userIds[m.from],
          body: m.body,
          isInternal: Boolean(m.internal),
          createdAt: minutesAfter(tickets[i].createdAt, m.afterMinutes),
        });
        messageCount += 1;
      }
    }
    console.log(`Seeded ${messageCount} messages.`);

    const statusCounts = {};
    tickets.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    console.log("Status spread:", JSON.stringify(statusCounts));
    console.log("Sample:", tickets[0].ticketNumber, "…",
      tickets[tickets.length - 1].ticketNumber);

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
