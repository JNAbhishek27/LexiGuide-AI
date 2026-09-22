/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Realistic, safe synthetic commercial legal agreement for testing & evaluation.
 * Contains standard contractual terms: Term, Payment, Termination, Liability,
 * Intellectual Property, Confidentiality, Automatic Renewal, and Dispute Resolution.
 */
export const SAMPLE_AGREEMENT_V1 = `MASTER SOFTWARE & CLOUD SERVICES AGREEMENT

This Master Software & Services Agreement ("Agreement") is made and entered into as of January 15, 2025 ("Effective Date"), by and between:
Apex Cloud Technologies Inc., a Delaware corporation with offices at 500 Enterprise Way, Suite 400, Wilmington, DE 19801 ("Provider" or "Apex"),
and
Novus Retail Solutions LLC, an Ohio limited liability company with principal offices at 120 Market Street, Columbus, OH 43215 ("Customer" or "Novus").

RECITALS
WHEREAS, Provider owns and operates a proprietary cloud-based inventory and supply chain analytics platform known as "ApexCore"; and
WHEREAS, Customer desires to subscribe to and utilize ApexCore services, and Provider agrees to deliver said services, pursuant to the terms and conditions outlined herein.

NOW, THEREFORE, the parties agree as follows:

SECTION 1. DEFINITIONS & ACCESS
1.1 "Authorized Users" means Customer's employees, agents, and independent contractors authorized to access ApexCore solely for Customer's internal business purposes.
1.2 "Customer Data" means all electronic data, transactions, inventory records, and files submitted by Customer into the platform. Customer retains sole title and ownership of Customer Data.
1.3 Service Level: Provider guarantees 99.5% monthly uptime, excluding scheduled maintenance announced at least 48 hours in advance.

SECTION 2. FEES, INVOICING & PAYMENT TERMS
2.1 Annual Subscription Fee: Customer shall pay Provider a base subscription fee of $48,000.00 USD per year, payable quarterly in advance ($12,000.00 per quarter).
2.2 Overage Charges: Should Customer exceed 50,000 monthly transaction processing units, additional units are billed at $0.08 per unit.
2.3 Payment Terms: Invoices are due within thirty (30) days from the invoice date. Late payments shall accrue interest at the rate of 1.5% per month or the statutory maximum, whichever is less.
2.4 Taxes: Fees are exclusive of all applicable federal, state, or local sales and excise taxes.

SECTION 3. TERM & AUTOMATIC RENEWAL
3.1 Initial Term: The initial term of this Agreement shall commence on the Effective Date and continue for a period of twelve (12) months ("Initial Term").
3.2 Automatic Renewal: Upon expiration of the Initial Term, this Agreement shall automatically renew for successive consecutive terms of twelve (12) months each, unless either party delivers written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term.
3.3 Fee Increases: Provider reserves the right to increase annual subscription fees by up to 8% upon the commencement of each renewal term upon 90 days prior written notice.

SECTION 4. TERMINATION & CANCELLATION CONDITIONS
4.1 Termination for Cause: Either party may terminate this Agreement immediately upon written notice if the other party breaches any material term and fails to cure such breach within thirty (30) days of receiving written notice specifying the breach.
4.2 Termination for Convenience: Customer may terminate this Agreement for convenience only after the completion of the first six (6) months of the Initial Term, subject to a mandatory early termination fee equal to fifty percent (50%) of the remaining unpaid subscription fees for the unexpired portion of the term.
4.3 Effect of Termination: Customer shall immediately cease access to ApexCore. Provider shall provide Customer with an export file of Customer Data within fourteen (14) calendar days following written request, after which Provider may securely purge all Customer Data.

SECTION 5. CONFIDENTIALITY & DATA PROTECTION
5.1 Definition of Confidential Information: Any proprietary, technical, financial, customer, or business data disclosed by either party that is marked confidential or reasonably understood to be confidential.
5.2 Standard of Care: The receiving party shall hold the disclosing party's Confidential Information in strict confidence and not disclose it to third parties, exercising the same degree of care it uses to protect its own confidential information, but not less than reasonable care.
5.3 Exclusions: Obligations do not apply to information that is publicly known through no breach, independently developed, or rightfully obtained from a third party without restriction.
5.4 Survival: Confidentiality obligations under this Section 5 shall survive termination or expiration of this Agreement for a period of three (3) years.

SECTION 6. INTELLECTUAL PROPERTY RIGHTS
6.1 Provider Ownership: Provider retains all right, title, and interest, including all patents, copyrights, trademarks, and trade secrets in and to the ApexCore platform, software, documentation, and any derivative works or enhancements created by Provider.
6.2 Restrictions: Customer shall not reverse engineer, decompile, disassemble, or attempt to derive source code from ApexCore, nor license, resell, or distribute the platform to unauthorized third parties.
6.3 Customer Feedback: Any suggestions, enhancement requests, or recommendations provided by Customer regarding the platform shall become the exclusive property of Provider without compensation.

SECTION 7. LIMITATION OF LIABILITY & INDEMNIFICATION
7.1 Consequential Damages Waiver: NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION, REGARDLESS OF THE THEORY OF LIABILITY.
7.2 Aggregate Liability Cap: EXCEPT FOR BREACHES OF SECTION 5 (CONFIDENTIALITY) OR WILLFUL MISCONDUCT, EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER OR RELATED TO THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE TOTAL FEES ACTUALLY PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
7.3 Indemnification by Customer: Customer agrees to defend, indemnify, and hold harmless Provider from any third-party claims arising from Customer's unlawful use of the platform or violation of applicable data privacy laws.

SECTION 8. GOVERNING LAW & DISPUTE RESOLUTION
8.1 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
8.2 Mandatory Arbitration: Any dispute, claim, or controversy arising out of or relating to this Agreement shall be settled exclusively by binding arbitration administered by the American Arbitration Association (AAA) in Wilmington, Delaware, before a single arbitrator.
8.3 Waiver of Jury Trial & Class Actions: THE PARTIES EXPLICITLY WAIVE ANY RIGHT TO TRIAL BY JURY AND AGREE THAT ANY PROCEEDINGS WILL BE CONDUCTED ON AN INDIVIDUAL BASIS ONLY, WITHOUT RECOURSE TO CLASS ACTIONS.

SECTION 9. MISCELLANEOUS
9.1 Entire Agreement: This Agreement constitutes the complete and exclusive understanding between the parties and supersedes all prior proposals, negotiations, and representations.
9.2 Amendments: No modification or amendment shall be effective unless in writing and signed by authorized representatives of both parties.
9.3 Force Majeure: Neither party shall be held liable for failure or delay caused by events beyond reasonable control, including acts of God, war, cyber terrorism, or widespread telecommunications failure.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

APEX CLOUD TECHNOLOGIES INC.
By: /s/ Marcus Vance
Name: Marcus Vance
Title: VP of Commercial Operations

NOVUS RETAIL SOLUTIONS LLC
By: /s/ Sarah Jenkins
Name: Sarah Jenkins
Title: Chief Technology Officer`;

/**
 * Second version with significant modifications (for Document Comparison):
 * - Shorter renewal notice
 * - Higher late payment interest (2.5%)
 * - Uncapped liability for data breaches
 * - Removal of termination for convenience
 * - Addition of mandatory insurance requirement
 */
export const SAMPLE_AGREEMENT_V2_REVISED = `MASTER SOFTWARE & CLOUD SERVICES AGREEMENT (AMENDED & RESTATED)

This Master Software & Services Agreement ("Agreement") is made and entered into as of January 15, 2026 ("Effective Date"), by and between:
Apex Cloud Technologies Inc., a Delaware corporation ("Provider" or "Apex"),
and
Novus Retail Solutions LLC, an Ohio limited liability company ("Customer" or "Novus").

RECITALS
WHEREAS, the parties desire to renew, amend, and restate their previous commercial agreement with modified commercial terms and obligations.

NOW, THEREFORE, the parties agree as follows:

SECTION 1. DEFINITIONS & ACCESS
1.1 "Authorized Users" means Customer's designated employees and affiliates authorized to access ApexCore.
1.2 "Customer Data" means all electronic data, customer records, and files submitted into ApexCore. Customer retains title.
1.3 Service Level: Provider guarantees 99.8% monthly uptime (increased from 99.5%), with liquidated credit rebates for downtime exceeding 1 hour.

SECTION 2. FEES, INVOICING & PAYMENT TERMS
2.1 Annual Subscription Fee: Customer shall pay Provider an updated base subscription fee of $54,000.00 USD per year (increased from $48,000), payable annually in advance.
2.2 Overage Charges: Transaction processing above 75,000 units billed at $0.06 per unit.
2.3 Payment Terms: Invoices are due within fifteen (15) days from invoice date (reduced from 30 days). Late payments accrue interest at 2.5% per month (increased from 1.5%).
2.4 Mandatory Security Deposit: Customer shall maintain a refundable $5,000 security deposit with Provider throughout the term.

SECTION 3. TERM & AUTOMATIC RENEWAL
3.1 Initial Term: Twenty-four (24) months ("Initial Term").
3.2 Automatic Renewal: Automatically renews for successive 12-month terms unless notice of non-renewal is given at least ninety (90) days in advance (increased from 60 days).
3.3 Fee Increases: Provider may adjust pricing by up to 10% annually with 60 days notice.

SECTION 4. TERMINATION & CANCELLATION CONDITIONS
4.1 Termination for Cause: Either party may terminate upon written notice if material breach is not cured within fifteen (15) days (reduced from 30 days).
4.2 Termination for Convenience: REMOVED. Neither party may terminate for convenience during the active term.
4.3 Data Return: Data export provided within seven (7) business days.

SECTION 5. CONFIDENTIALITY & DATA PROTECTION
5.1 Standard of Care: Strict confidentiality with ISO 27001 compliant technical safeguards.
5.2 Data Breach Notification: Provider must notify Customer within 24 hours of any suspected unauthorized access to Customer Data.
5.3 Survival: Five (5) years following termination (increased from 3 years).

SECTION 6. INTELLECTUAL PROPERTY & DATA RIGHTS
6.1 Ownership: Provider owns platform; Customer owns all input data and derived business analytics models generated specifically for Customer.
6.2 Feedback: Customer retains rights to proprietary feedback unless specifically licensed in writing.

SECTION 7. LIABILITY & INDEMNIFICATION
7.1 Consequential Damages: Disclaimed by both parties except for gross negligence.
7.2 Liability Cap: Total liability capped at two times (2x) the annual contract value, EXCEPT for data breaches and confidentiality violations, which are UNLIMITED and UNCAPPED.
7.3 Cyber Insurance: Customer must maintain at least $2,000,000 in Cyber Liability Insurance and name Provider as an additional insured.

SECTION 8. DISPUTE RESOLUTION & VENUE
8.1 Governing Law: State of Delaware.
8.2 Venue: Exclusive jurisdiction in the state or federal courts located in New Castle County, Delaware; AAA arbitration is optional upon mutual written consent.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.`;
