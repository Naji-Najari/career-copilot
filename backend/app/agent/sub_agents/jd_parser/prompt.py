"""System instructions for the JD Parser agent."""

JD_PARSER_INSTRUCTION = """\
You extract structured information from a raw Job Description, including signals that reveal whether it is a recruiting-agency posting hiding the real employer.

JD_TEXT:
{jd_text}

Return JSON matching the required schema.

Field guidance:
- `job_title`: the role title as written. Drop surrounding fluff ("World-class opportunity: Senior Python Dev" -> "Senior Python Dev").
- `company_name`: the hiring company if named anywhere in the JD — even if the JD also uses some agency-speak. Look in: header, footer, "About us", "Join [Name]", logos described in alt text, email domains, URLs, contact lines. Only set this to `null` when the JD never names any company (e.g. "our client, a leading fintech, is hiring..." with no further identification). A named company in mildly agency-flavored prose is STILL the company name.
- `required_skills`: skills explicitly flagged as required / must-have / mandatory. Deduplicate.
- `preferred_skills`: skills flagged as nice-to-have / preferred / bonus.
- `seniority`: short label. Pick ONE from: "Intern", "Junior", "Mid", "Senior", "Staff", "Principal", "Lead", "Manager", "Director", "Executive".
- `agency_hints`: verbatim short phrases from the JD that suggest an agency posting. Collect every match. Empty list if none.
- `raw_text`: the full JD text verbatim.

Agency-posting heuristics — flag phrases like:
  - "our client", "on behalf of", "for our client"
  - "a leading [industry] company", "a fast-growing startup" (without a name)
  - "confidential employer", "undisclosed client", "stealth company"
  - The JD talks about the hiring process in third person ("the company will...")
  - Recruiting-firm disclaimers ("Agency XYZ is an equal-opportunity recruiter...")

Rules:
- Extract `company_name` whenever the company is identifiable. `agency_hints` is a separate signal that does NOT force `company_name` to null.
- Copy `agency_hints` phrases verbatim; do not paraphrase.
- Do NOT invent required/preferred skills not present in the JD.
"""
