"""Build Entrepedia Wave 1 inventory CSV/JSON for iMU import planning.

Run: python scripts/build_wave1_inventory.py
Outputs: data/entrepedia-wave1/inventory.json + inventory.csv
No credentials; inventory only — no downloads.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "entrepedia-wave1"

# Entrepedia format -> iMU catalog type
FORMAT_TO_IMU = {
    "Book": "book",
    "Guide": "guide",
    "Mini-Course": "course",
    "Audio": "audio",
    "Workbook": "guide",
    "Checklist": "guide",
    "Listicle": "guide",
    "Template": "guide",
    "Notion Template": "guide",
    "Prompt Pack": "guide",
    "Toolstack": "guide",
}

# Bundle slug -> (imu_category, priority_batch, rewrite_bundle_title, rewrite_summary)
BUNDLE_META: dict[str, tuple[str, int, str, str]] = {
    "the-cash-flow-system-for-small-businesses": (
        "wealth-creation",
        1,
        "Cash Flow Desk for Operators",
        "Track, forecast, and stabilize business cash so growth does not starve the desk.",
    ),
    "the-first-time-entrepreneur-launchpad": (
        "wealth-creation",
        1,
        "First Seat Launchpad",
        "Lean offer, pricing, and first-customer path for founders opening their first desk.",
    ),
    "package-what-you-know-into-a-high-ticket-offer": (
        "marketing",
        1,
        "High-Ticket Offer Packaging",
        "Turn expertise into a premium, deliverable offer with value-based pricing.",
    ),
    "build-an-ecommerce-store-that-sells": (
        "e-commerce",
        2,
        "Store That Converts",
        "Conversion, speed, and validation for e-commerce desks that need paid traffic to pay back.",
    ),
    "the-psychology-of-closing": (
        "marketing",
        2,
        "Closing Psychology",
        "Objection handling and pre-call confidence for high-trust closes.",
    ),
    "the-neuromarketing-edge": (
        "marketing",
        2,
        "Neuromarketing Edge",
        "Brain-trigger copy and friction audits for pages that stop the scroll and sell.",
    ),
    "agency-growth-blueprint": (
        "marketing",
        2,
        "Agency Owner Blueprint",
        "Move from operator chaos to owner systems: ops, scaling, and 90-day transformation.",
    ),
    "the-resilient-leader": (
        "personal-development",
        3,
        "Resilient Leadership",
        "Crisis-proof leadership without collapsing authority or suppressing the hard signal.",
    ),
    "habits-without-willpower": (
        "personal-development",
        3,
        "Habit Architecture",
        "Automatic routines that stick without relying on willpower spikes.",
    ),
    "the-neuroscience-of-peak-productivity": (
        "personal-development",
        3,
        "Flow Operating System",
        "Neuroscience-backed focus and flow design for remote and desk work.",
    ),
    "building-a-faceless-empire": (
        "social-media",
        2,
        "Faceless Brand Desk",
        "Build and monetize digital products without putting your face on every asset.",
    ),
    "the-freelancers-cash-bridge": (
        "wealth-creation",
        1,
        "Freelancer Cash Bridge",
        "Bridge Net-30 gaps with productized offers and marketplace-ready listings.",
    ),
    "monetizing-attention-without-selling-your-soul": (
        "social-media",
        2,
        "Attention Monetization Flywheel",
        "Turn followers into profit with hooks, digital products, and a clean monetization path.",
    ),
    "fitness-without-hustle": (
        "fitness-nutrition",
        3,
        "Fitness Without Hustle",
        "Sustainable energy and reset systems for high performers who refuse burnout fitness.",
    ),
    "working-smarter-with-virtual-assistants": (
        "personal-development",
        3,
        "VA Desk Systems",
        "Hire, onboard, and delegate so the founder stops being the bottleneck.",
    ),
}

# slug -> list of {title, url, format?}  format optional; inferred later if missing
BUNDLES: dict[str, list[dict[str, str]]] = {
    "the-cash-flow-system-for-small-businesses": [
        {"title": "Business Cash Control", "url": "https://www.entrepedia.co/library/product/af0b575d-d13d-4b36-bd05-72c4fcb5593d", "format": "Audio"},
        {"title": "7 Cash Flow Mistakes That Sink Profitable Businesses", "url": "https://www.entrepedia.co/library/product/1ab9761e-476a-446e-b7be-224031cb36b7", "format": "Listicle"},
        {"title": "Master Your Cash Flow in 7 Days", "url": "https://www.entrepedia.co/library/product/2d160c1b-e470-4e4a-a7d4-5807c9b55dbb", "format": "Mini-Course"},
        {"title": "Control Your Business Cash Flow", "url": "https://www.entrepedia.co/library/product/8e36c202-0313-483b-8158-4ed9687cffb5", "format": "Prompt Pack"},
        {"title": "The Weekend Cash Control Setup", "url": "https://www.entrepedia.co/library/product/24ef61c3-d2a2-4868-90e9-46a84748aa41", "format": "Guide"},
        {"title": "Red Light Emergency Protocol", "url": "https://www.entrepedia.co/library/product/5331a4f2-77c7-421d-84f1-a6e391555bc8", "format": "Checklist"},
        {"title": "The Cash Flow System for Small Businesses", "url": "https://www.entrepedia.co/library/product/a5a8efa2-7cc4-498a-9b16-9a5b2bd895ed", "format": "Book"},
    ],
    "the-first-time-entrepreneur-launchpad": [
        {"title": "The Entrepreneur Starting Line", "url": "https://www.entrepedia.co/library/product/b0f310fd-7892-4f76-a1c2-e19907339cbb"},
        {"title": "21 Money Traps That Kill First-Time Businesses Before They Start", "url": "https://www.entrepedia.co/library/product/333d4f38-adad-44f5-8054-58b1cdd14d7b"},
        {"title": "Get Your First Paying Customer", "url": "https://www.entrepedia.co/library/product/274850ee-c849-4f8c-b8e6-d033d284c126"},
        {"title": "First-Time Entrepreneurs Launch Assistant", "url": "https://www.entrepedia.co/library/product/4aab5077-1926-4d8f-a364-3f0d8fb0ac8a"},
        {"title": "The Three-Number Pricing Formula", "url": "https://www.entrepedia.co/library/product/39abbf1c-1b66-4d6c-b61b-e29418fa44c6"},
        {"title": "Minimum Viable Offer Design", "url": "https://www.entrepedia.co/library/product/4c3edb46-e7b5-48b8-bb66-bc7f8afc0feb"},
        {"title": "The 30-Day Lean Launch Plan", "url": "https://www.entrepedia.co/library/product/f3efc6bf-23ba-4c7d-ba52-d343c35a9f1f"},
        {"title": "The First-Time Entrepreneur Launchpad", "url": "https://www.entrepedia.co/library/product/9cac05cf-3b04-4f50-ba37-8cd2ea37f08e"},
    ],
    "package-what-you-know-into-a-high-ticket-offer": [
        {"title": "The Scalable Expert Model", "url": "https://www.entrepedia.co/library/product/63ce6ea6-5f68-47ac-b8d7-94d6b57e0826"},
        {"title": "13 Signs Your Offer Is Ready for Premium Pricing", "url": "https://www.entrepedia.co/library/product/d8b5afba-ad0b-4470-979c-21544f2c8c9c"},
        {"title": "Launch Your First High-Ticket Offer", "url": "https://www.entrepedia.co/library/product/b0773f41-e5c2-4f41-8e4a-822de328e6b1"},
        {"title": "Build Your High-Ticket Service Business", "url": "https://www.entrepedia.co/library/product/a183bb60-6289-45d9-80c3-f99d8db2d5a0"},
        {"title": "From Hourly to Value-Based Pricing", "url": "https://www.entrepedia.co/library/product/43eb991c-e70b-41e7-8bd7-a8ac3f2e70bc"},
        {"title": "The Scalable Service Delivery Setup", "url": "https://www.entrepedia.co/library/product/2c7ba419-201f-4023-aff1-2e9834420ffd"},
        {"title": "Package What You Know Into a High-Ticket Offer", "url": "https://www.entrepedia.co/library/product/df67aed0-3390-44c0-9e86-ddd760c358ff"},
    ],
    "build-an-ecommerce-store-that-sells": [
        {"title": "Stores That Convert", "url": "https://www.entrepedia.co/library/product/59d734a2-7a20-415c-a76b-be9f42a352b5"},
        {"title": "7 Conversion Killers Hiding on Your Product Pages", "url": "https://www.entrepedia.co/library/product/ec083bc3-6876-43bd-9eed-7b91ca2d4c9b"},
        {"title": "7-day Store Transformation", "url": "https://www.entrepedia.co/library/product/d1508d50-285d-4265-a4f1-48efc8f7c712"},
        {"title": "The E-Commerce Store Architect", "url": "https://www.entrepedia.co/library/product/b4c8f7d3-6a14-4acd-b29d-3c3f1a58472b"},
        {"title": "Site Speed Optimization for Non-Technical Store Owners", "url": "https://www.entrepedia.co/library/product/afcd3cf8-44c1-44f5-9d0a-f9efcbb30498"},
        {"title": "Pre-Launch Store Validation", "url": "https://www.entrepedia.co/library/product/7c3b20c9-e03e-4c37-84e4-bc27a7197e74"},
        {"title": "Build an Ecommerce Store That Sells", "url": "https://www.entrepedia.co/library/product/d21fb0af-ca9e-4940-9ab1-b6783e818144"},
    ],
    "the-psychology-of-closing": [
        {"title": "The Confident Closer", "url": "https://www.entrepedia.co/library/product/d1bbc971-9e27-475a-ab9b-0edb572054ce"},
        {"title": "21 Objections That Actually Mean They Want to Buy", "url": "https://www.entrepedia.co/library/product/5387da19-5fbf-482c-80f2-4d6d482c63f6"},
        {"title": "Transform Your Sales Confidence", "url": "https://www.entrepedia.co/library/product/3099e72e-b64a-439a-abf4-7d0949b0e435"},
        {"title": "Mastering Confident Sales Closing", "url": "https://www.entrepedia.co/library/product/c1956ce5-9bd9-4a99-9f2c-d7af76dd9f64"},
        {"title": "The 3R Method for Objection Handling", "url": "https://www.entrepedia.co/library/product/86816b07-08a7-4abb-86e4-ac5e218804f9"},
        {"title": "The Pre-Call Confidence & Preparation", "url": "https://www.entrepedia.co/library/product/42f23d1d-1d66-41ff-8f3a-ea932137bd5e"},
        {"title": "The Psychology of Closing", "url": "https://www.entrepedia.co/library/product/e5bcddbf-65ac-4434-817f-587710c49cf1"},
    ],
    "the-neuromarketing-edge": [
        {"title": "Marketing to the Subconscious", "url": "https://www.entrepedia.co/library/product/721e90d8-3d77-442d-9650-bb3fc7415b20"},
        {"title": "21 Brain Triggers That Make People Stop, Read, and Buy", "url": "https://www.entrepedia.co/library/product/0c792bb5-6723-4b70-864c-de54057a9bf9"},
        {"title": "7 Days to Brain-Proof Marketing", "url": "https://www.entrepedia.co/library/product/34c1fe03-cb82-4cd1-ab36-3d3379b1393a"},
        {"title": "Put Neuromarketing to Work Today", "url": "https://www.entrepedia.co/library/product/572dcfd4-ed0b-43f3-a78a-17447db03b41"},
        {"title": "The Complete Neurological Friction Audit", "url": "https://www.entrepedia.co/library/product/773d2d42-179f-4e01-b566-c715c2687381"},
        {"title": "Is Your Marketing Brain-Ready?", "url": "https://www.entrepedia.co/library/product/85c54f8f-ef66-419a-aef2-91a08bc69c97"},
        {"title": "The Neuromarketing Edge", "url": "https://www.entrepedia.co/library/product/bdd82f9a-7150-4736-b032-0b28134a137b"},
    ],
    "agency-growth-blueprint": [
        {"title": "Agency Scaling Systems", "url": "https://www.entrepedia.co/library/product/98a4ba01-9eb6-45fc-b1af-c204f6938353"},
        {"title": "7 Mistakes That Keep Agencies Stuck in Chaos and Burnout", "url": "https://www.entrepedia.co/library/product/984a07a5-09f1-43bb-b720-6e8d1fc8f61c"},
        {"title": "From Agency Operator to Owner", "url": "https://www.entrepedia.co/library/product/e5122d96-4df6-4479-8747-395186cc2d3c"},
        {"title": "Agency Operations & Scaling", "url": "https://www.entrepedia.co/library/product/d7751c42-3e00-4d20-8d9d-f53237751bb9"},
        {"title": "Agency Transformation Assistant", "url": "https://www.entrepedia.co/library/product/bea79b7f-f8e4-4787-9128-b78568c36077"},
        {"title": "The 90-Day Agency Transformation", "url": "https://www.entrepedia.co/library/product/85c9cf4e-4a94-4804-9f68-821ea35409a4"},
        {"title": "The Operator-to-Owner Audit", "url": "https://www.entrepedia.co/library/product/b752006b-8b0a-43b8-ac07-ed19554d262e"},
        {"title": "Agency Growth Blueprint", "url": "https://www.entrepedia.co/library/product/4a25a683-2222-4e92-b9e1-e2ead568fff9"},
    ],
    "the-resilient-leader": [
        {"title": "Leadership Without Collapse", "url": "https://www.entrepedia.co/library/product/cfaab94e-37ae-4187-acb9-234d408aadab"},
        {"title": "13 Signs You're Suppressing Your Crisis Instead of Managing It", "url": "https://www.entrepedia.co/library/product/68baaf0d-c009-4b90-9816-420365fe595e"},
        {"title": "Build Your Crisis-Proof Leadership System", "url": "https://www.entrepedia.co/library/product/0f6a4211-e3fa-414c-a48b-3d0f93200f16"},
        {"title": "Disclose Without Losing Authority", "url": "https://www.entrepedia.co/library/product/7c738f27-4469-4ebd-aec7-ab9fe3284143"},
        {"title": "Personal Crisis Pre-Flight Check", "url": "https://www.entrepedia.co/library/product/e6fb1c42-6b19-4c97-a1e2-de23fc2fded2"},
        {"title": "The Resilient Leader", "url": "https://www.entrepedia.co/library/product/fc2e3519-1d80-4d4a-82f9-bbf617229d32"},
    ],
    "habits-without-willpower": [
        {"title": "The Habit Architecture", "url": "https://www.entrepedia.co/library/product/156ac1ae-df9c-4092-9eb4-832ddd433afd"},
        {"title": "13 Mistakes That Trap Everyone in the Restart Cycle", "url": "https://www.entrepedia.co/library/product/a16d4f8b-f650-43a3-bda0-486b131981ff"},
        {"title": "Make Any Habit Automatic in 7 Days", "url": "https://www.entrepedia.co/library/product/9d0c03f0-a845-4b6a-b5c4-daf831154309"},
        {"title": "Build Unbreakable Daily Routines in 30 Days", "url": "https://www.entrepedia.co/library/product/609bc282-8cdd-439b-b4b6-add9f923d645"},
        {"title": "The Complete Habit Formation System", "url": "https://www.entrepedia.co/library/product/811bd83f-d160-4c10-82e0-108112b28b89"},
        {"title": "Habits Without Willpower", "url": "https://www.entrepedia.co/library/product/7038a885-14dd-4c8a-9e52-45348fb9cb64"},
    ],
    "the-neuroscience-of-peak-productivity": [
        {"title": "The Flow Operating System", "url": "https://www.entrepedia.co/library/product/2f057ea5-1e85-4d79-b09a-535a648548c4"},
        {"title": "13 Invisible Focus Killers Blocking Your Flow States", "url": "https://www.entrepedia.co/library/product/69d4c01a-34af-4531-9b40-fa0e9f917a2a"},
        {"title": "7 Neuroscience-Backed Triggers That Unlock Flow States", "url": "https://www.entrepedia.co/library/product/4122a9cb-714e-4397-bc02-a377ed07e120"},
        {"title": "Flow State Mastery", "url": "https://www.entrepedia.co/library/product/e73448f6-76cd-4c43-b44d-09aaee352d4f"},
        {"title": "The Personal Flow Operating System", "url": "https://www.entrepedia.co/library/product/64ab9c10-6756-4fd7-8e32-88e572e8f80d"},
        {"title": "The Remote Worker's Flow Blueprint", "url": "https://www.entrepedia.co/library/product/ccf8210b-6182-4800-933b-fec3b941cfed"},
        {"title": "The Focus Killer Elimination Audit", "url": "https://www.entrepedia.co/library/product/143c491e-54f2-4973-8d7f-40ffb23d19c6"},
        {"title": "The Neuroscience of Peak Productivity", "url": "https://www.entrepedia.co/library/product/172f085c-4dbb-4506-8bd8-022610e7264c"},
    ],
    "building-a-faceless-empire": [
        {"title": "Build Without Being Seen", "url": "https://www.entrepedia.co/library/product/e6c7ad66-4a4f-4637-a522-5544082a0fea"},
        {"title": "21 Faceless Business Models Generating Real Income", "url": "https://www.entrepedia.co/library/product/55cf23f7-0213-4a43-8fb7-73947d481906"},
        {"title": "The Faceless Launch", "url": "https://www.entrepedia.co/library/product/9e5be5ab-60c4-481c-a28c-932e67318abd"},
        {"title": "Faceless Digital Business Builder", "url": "https://www.entrepedia.co/library/product/4b753d72-359b-4eae-97b8-510b05d19a97"},
        {"title": "The 24-Hour Digital Product Creation Playbook", "url": "https://www.entrepedia.co/library/product/c70f010f-91ec-4597-975c-e86f75450dd3"},
        {"title": "The 60-Minute Weekly Content Factory", "url": "https://www.entrepedia.co/library/product/3b8ef351-da7e-4e27-af34-8cb74d62c893"},
        {"title": "The 7-Day Faceless Brand Launch Blueprint", "url": "https://www.entrepedia.co/library/product/fb915be2-edd4-4894-b424-e7dddf18691e"},
        {"title": "Building a Faceless Empire", "url": "https://www.entrepedia.co/library/product/30935ed1-bdb7-4e6c-b85a-baa89352b8ff"},
    ],
    "the-freelancers-cash-bridge": [
        {"title": "Fast Cash Freelancer", "url": "https://www.entrepedia.co/library/product/d504809a-3969-41b2-a67f-b4fd0611e720"},
        {"title": "13 Cash Bridge Moves Every Freelancer Needs Before Their Next Net-30 Wait", "url": "https://www.entrepedia.co/library/product/1f2ae2d5-d967-4131-9659-b14f97761154"},
        {"title": "Build Your First Cash Bridge", "url": "https://www.entrepedia.co/library/product/321c3f92-dab4-4e1c-8548-95876fc01399"},
        {"title": "The Freelancer's Fast Cash Strategies", "url": "https://www.entrepedia.co/library/product/da3889b2-8b75-4b0f-91ad-c7b84da3a141"},
        {"title": "Productize Any Freelance Skill in One Weekend", "url": "https://www.entrepedia.co/library/product/2df7f1d1-f2fd-414f-80da-c314603e307d"},
        {"title": "Is Your Marketplace Listing Ready to Publish?", "url": "https://www.entrepedia.co/library/product/84465cd7-3341-47bd-b2cf-080dd2d54d1a"},
        {"title": "The Freelancer's Cash Bridge", "url": "https://www.entrepedia.co/library/product/08182e7d-b3cf-49e2-9bcc-0f2a57f8d4c6"},
    ],
    "monetizing-attention-without-selling-your-soul": [
        {"title": "The Monetization Flywheel", "url": "https://www.entrepedia.co/library/product/2906e44a-bf26-4351-8b6b-df88a288c8a6"},
        {"title": "13 Proven Hook Formulas for Scroll-Stopping Content", "url": "https://www.entrepedia.co/library/product/b1466c95-3fca-42af-a23a-00ae214ded97"},
        {"title": "7 Monetization Mistakes Sinking Your Creator Business", "url": "https://www.entrepedia.co/library/product/37b9e2e8-1010-4cd1-b780-a832ba7e4aab"},
        {"title": "The Proven System for Turning Followers into Profit", "url": "https://www.entrepedia.co/library/product/d43b2e9d-1282-4a5e-9cbb-358fed8c36b4"},
        {"title": "Creator Economy Toolkit", "url": "https://www.entrepedia.co/library/product/0d18003c-002f-41c3-86f7-85ee3b6caa05"},
        {"title": "The Creator's Profit Assistant", "url": "https://www.entrepedia.co/library/product/b91ae74d-838a-456d-890a-a0a88bf4fede"},
        {"title": "Your First Digital Product Launch", "url": "https://www.entrepedia.co/library/product/14c62dff-f064-46c7-9434-a8aa8489ee96"},
        {"title": "The Scroll-Stopping Content System", "url": "https://www.entrepedia.co/library/product/3787b290-2fab-4aa6-81cc-4a06e00ee83e"},
        {"title": "Hook-Story-Monetize Content Creation", "url": "https://www.entrepedia.co/library/product/d28e5aa1-5830-438f-8e10-f4742ce71505"},
        {"title": "Monetizing Attention Without Selling Your Soul", "url": "https://www.entrepedia.co/library/product/95d7f9f5-b968-45c0-a2a6-ca83cb0e657f"},
    ],
    "fitness-without-hustle": [
        {"title": "The Energy Advantage", "url": "https://www.entrepedia.co/library/product/f2573700-9b3c-470f-aeab-a2dfce747a19"},
        {"title": "7 Fitness Myths Keeping High Performers Burned Out", "url": "https://www.entrepedia.co/library/product/78a4d237-caa5-4fc0-bf8b-199092c165a5"},
        {"title": "The Smarter Way to Stay Fit and Focused", "url": "https://www.entrepedia.co/library/product/4727d6c8-ef09-4890-94d5-246e543153a9"},
        {"title": "The 3R Daily Reset System", "url": "https://www.entrepedia.co/library/product/bc1b4cb9-89d6-42cf-8368-ca22bfb0a61d"},
        {"title": "Fitness Without Hustle", "url": "https://www.entrepedia.co/library/product/0ed5697b-cfc0-4e65-a335-3d07a80dcc4c"},
    ],
    "working-smarter-with-virtual-assistants": [
        {"title": "Escape the Founder Bottleneck", "url": "https://www.entrepedia.co/library/product/22dbdbbe-66bc-4faa-96dd-1d83cf11c5fa"},
        {"title": "13 Red Flags Your VA System Is Broken", "url": "https://www.entrepedia.co/library/product/eb9c2124-d0d1-4b63-a50e-7b199b8392ff"},
        {"title": "7 Delegation Mistakes Stealing Your Time With VAs", "url": "https://www.entrepedia.co/library/product/acd52a3d-fee6-43fe-8d04-3f1c9b51dfa4"},
        {"title": "Buy Back Your Week with VA", "url": "https://www.entrepedia.co/library/product/efe2aa3f-1664-4744-bbd3-a3ec3b8e915b"},
        {"title": "Virtual Team Management", "url": "https://www.entrepedia.co/library/product/4c82d2bf-4f88-472c-bee5-80bba0223549"},
        {"title": "The Virtual Assistant Management", "url": "https://www.entrepedia.co/library/product/600fd286-17d3-41bf-824a-595061eb5b9d"},
        {"title": "Virtual Assistant Onboarding", "url": "https://www.entrepedia.co/library/product/8dca028e-9ffb-492b-ac9e-f33007a7aeed"},
        {"title": "Preparing Your Business for Virtual Assistant Success", "url": "https://www.entrepedia.co/library/product/d3989d21-1ab6-4aa5-b0bb-bca4e2082906"},
        {"title": "The Virtual Assistant Hiring Readiness", "url": "https://www.entrepedia.co/library/product/7a09fcf0-908b-40c8-9dca-cec5e5b7a3c6"},
        {"title": "Working Smarter with Virtual Assistants", "url": "https://www.entrepedia.co/library/product/a5a42240-7d1f-450e-81a6-5747de764880"},
    ],
}

# Standalone series (not under a /bundles/ slug)
STANDALONE: list[dict[str, str]] = [
    {
        "series": "Beyond the Side Hustle",
        "title": "Beyond the Side Hustle",
        "url": "https://www.entrepedia.co/library/product/2a406523-6193-4889-8b78-26077db61e41",
        "format": "Audio",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "Beyond the Side Hustle (Audio)",
        "imu_summary": "Score income models before you sink capital into the wrong passive bet.",
    },
    {
        "series": "Beyond the Side Hustle",
        "title": "7 Passive Income Lies That Cost First-Time Builders $20,000",
        "url": "https://www.entrepedia.co/library/product/8eafc1b7-3f6c-4269-90f4-a9c4c8041f8c",
        "format": "Listicle",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "Seven Passive Income Lies",
        "imu_summary": "Kill the myths that burn first-time builders before a real stream exists.",
    },
    {
        "series": "Beyond the Side Hustle",
        "title": "Build Your First Passive Income Stream",
        "url": "https://www.entrepedia.co/library/product/d1b72a53-30a8-4512-b599-b399ffdf17f6",
        "format": "Mini-Course",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "First Passive Income Stream",
        "imu_summary": "Step-by-step build of one passive stream with a clear handoff to systems.",
    },
    {
        "series": "Beyond the Side Hustle",
        "title": "Passive Income Build & Systematize",
        "url": "https://www.entrepedia.co/library/product/e8eb587f-d1e1-49eb-9fd2-45b3f1d650ae",
        "format": "Prompt Pack",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "Passive Income Build Prompts",
        "imu_summary": "AI prompts to score ideas, run a 90-day launch, and go hands-off.",
    },
    {
        "series": "Beyond the Side Hustle",
        "title": "Score Your Passive Income Idea in 30 Minutes",
        "url": "https://www.entrepedia.co/library/product/42580bd1-7dfb-4ee3-86fc-a1ff1305e077",
        "format": "Guide",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "30-Minute Passive Idea Score",
        "imu_summary": "Cost / Effort / Return scoring before you commit capital.",
    },
    {
        "series": "Beyond the Side Hustle",
        "title": "Pick Your Passive Income Stream",
        "url": "https://www.entrepedia.co/library/product/cc4987b6-0fe0-472e-b315-5fe86d845f3b",
        "format": "Book",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "Pick Your Passive Stream",
        "imu_summary": "CER framework for choosing a lasting income model.",
    },
    {
        "series": "Cost Control That Compounds",
        "title": "Cost Control That Compounds",
        "url": "https://www.entrepedia.co/library/product/e224aaf1-1d7d-49a1-b58b-526cb36ae556",
        "format": "Audio",
        "category": "wealth-creation",
        "batch": "1",
        "imu_title": "Cost Control That Compounds",
        "imu_summary": "Cut costs without cutting the revenue engine.",
    },
]

BUNDLE_DISPLAY = {
    "the-cash-flow-system-for-small-businesses": "The Cash Flow System for Small Businesses",
    "the-first-time-entrepreneur-launchpad": "The First-Time Entrepreneur Launchpad",
    "package-what-you-know-into-a-high-ticket-offer": "Package What You Know Into a High-Ticket Offer",
    "build-an-ecommerce-store-that-sells": "Build an Ecommerce Store That Sells",
    "the-psychology-of-closing": "The Psychology of Closing",
    "the-neuromarketing-edge": "The Neuromarketing Edge",
    "agency-growth-blueprint": "Agency Growth Blueprint",
    "the-resilient-leader": "The Resilient Leader",
    "habits-without-willpower": "Habits Without Willpower",
    "the-neuroscience-of-peak-productivity": "The Neuroscience of Peak Productivity",
    "building-a-faceless-empire": "Building a Faceless Empire",
    "the-freelancers-cash-bridge": "The Freelancer's Cash Bridge",
    "monetizing-attention-without-selling-your-soul": "Monetizing Attention Without Selling Your Soul",
    "fitness-without-hustle": "Fitness Without Hustle",
    "working-smarter-with-virtual-assistants": "Working Smarter with Virtual Assistants",
}


def infer_format(title: str, known: str | None) -> str:
    if known:
        return known
    t = title.lower()
    if any(x in t for x in ("mistakes", "signs", "lies", "myths", "red flags", "triggers", "formulas", "moves", "killers")):
        return "Listicle"
    if "assistant" in t or "prompt" in t:
        return "Prompt Pack"
    if any(x in t for x in ("7-day", "7 day", "30-day", "90-day", "launch", "mastery", "transformation", "build your")):
        return "Mini-Course"
    if any(x in t for x in ("audit", "checklist", "readiness", "protocol", "pre-flight")):
        return "Checklist"
    if any(x in t for x in ("blueprint", "playbook", "system", "framework", "setup", "plan", "method")):
        return "Guide"
    # Flagship title often matches bundle name -> Book
    return "Book"


def imu_title_for(entrepedia_title: str, bundle_rewrite: str, is_flagship: bool) -> str:
    if is_flagship:
        return bundle_rewrite
    # Light rewrite: drop generic filler, keep operator tone
    return entrepedia_title.replace("Your ", "").replace("The ", "", 1) if entrepedia_title.startswith("The ") else entrepedia_title


def build_rows() -> list[dict[str, str | int]]:
    rows: list[dict[str, str | int]] = []
    for slug, products in BUNDLES.items():
        cat, batch, rewrite_title, rewrite_summary = BUNDLE_META[slug]
        bundle_url = f"https://www.entrepedia.co/library/bundles/{slug}"
        display = BUNDLE_DISPLAY[slug]
        for i, p in enumerate(products):
            fmt = infer_format(p["title"], p.get("format"))
            is_flagship = i == len(products) - 1 or p["title"].rstrip(".") == display.rstrip(".")
            pid = p["url"].rsplit("/", 1)[-1]
            rows.append(
                {
                    "wave": 1,
                    "download_batch": batch,
                    "source_type": "bundle_product",
                    "bundle_slug": slug,
                    "bundle_title": display,
                    "bundle_url": bundle_url,
                    "product_id": pid,
                    "entrepedia_title": p["title"],
                    "entrepedia_url": p["url"],
                    "entrepedia_format": fmt,
                    "imu_type": FORMAT_TO_IMU.get(fmt, "guide"),
                    "imu_category": cat,
                    "imu_title": imu_title_for(p["title"], rewrite_title, is_flagship),
                    "imu_summary": rewrite_summary if is_flagship else f"Part of {rewrite_title}: {p['title']}.",
                    "status": "inventory",
                    "staging_hint": f"iMU-import\\batch-{batch}\\{slug}",
                }
            )

    for s in STANDALONE:
        pid = s["url"].rsplit("/", 1)[-1]
        fmt = s["format"]
        rows.append(
            {
                "wave": 1,
                "download_batch": int(s["batch"]),
                "source_type": "standalone_series",
                "bundle_slug": "",
                "bundle_title": s["series"],
                "bundle_url": "",
                "product_id": pid,
                "entrepedia_title": s["title"],
                "entrepedia_url": s["url"],
                "entrepedia_format": fmt,
                "imu_type": FORMAT_TO_IMU.get(fmt, "guide"),
                "imu_category": s["category"],
                "imu_title": s["imu_title"],
                "imu_summary": s["imu_summary"],
                "status": "inventory",
                "staging_hint": f"iMU-import\\batch-{s['batch']}\\beyond-side-hustle",
            }
        )
    return rows


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    rows = build_rows()
    fieldnames = list(rows[0].keys())

    csv_path = OUT / "inventory.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    by_batch: dict[int, int] = {}
    by_cat: dict[str, int] = {}
    for r in rows:
        b = int(r["download_batch"])
        by_batch[b] = by_batch.get(b, 0) + 1
        c = str(r["imu_category"])
        by_cat[c] = by_cat.get(c, 0) + 1

    payload = {
        "wave": 1,
        "generated_by": "scripts/build_wave1_inventory.py",
        "product_count": len(rows),
        "bundle_count": len(BUNDLES),
        "standalone_count": len(STANDALONE),
        "by_download_batch": by_batch,
        "by_imu_category": by_cat,
        "batch1_download_note": (
            "Download only download_batch==1 first. Stage under OneDrive "
            "iMU-import\\batch-1\\, keep staging under ~2GB, upload via /admin/media, then delete local ZIPs."
        ),
        "items": rows,
    }
    json_path = OUT / "inventory.json"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(rows)} rows -> {csv_path}")
    print(f"Wrote JSON -> {json_path}")
    print(f"Batches: {by_batch}")
    print(f"Categories: {by_cat}")


if __name__ == "__main__":
    main()
