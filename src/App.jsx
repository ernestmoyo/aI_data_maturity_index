import { useState, useCallback, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Shield,
  Database,
  CheckCircle,
  BarChart2,
  Cpu,
  Gavel,
  ChevronRight,
  ChevronLeft,
  Download,
  Copy,
  Mail,
  Share2,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

/* =========================================================================
   CONSTANTS
   ========================================================================= */

const COLORS = {
  navy: "#0B1F3A",
  orange: "#F4821F",
  gold: "#C9963A",
  slate: "#1E3A5F",
  bg: "#F4F6FA",
  white: "#FFFFFF",
  text: "#1A2B3C",
  textMuted: "#6B7E93",
  red: "#DC2626",
  amber: "#D97706",
  blue: "#2563EB",
  green: "#16A34A",
};

const DCAM_LEVELS = [
  { min: 0, max: 0.9, label: "Non-initiated" },
  { min: 1, max: 1.9, label: "Conceptual" },
  { min: 2, max: 2.7, label: "Developmental" },
  { min: 2.8, max: 3.4, label: "Defined" },
  { min: 3.5, max: 4.4, label: "Achieved" },
  { min: 4.5, max: 5.0, label: "Enhanced" },
];

const LEVEL_LABELS = [
  "Non-initiated",
  "Conceptual",
  "Developmental",
  "Defined",
  "Achieved",
  "Enhanced",
];

const DIMENSIONS = [
  {
    id: "dim1",
    name: "Data Governance & Stewardship",
    icon: Shield,
    dcamLabel: "DCAM Components 1 & 2 | Regulatory Weight: 30%",
    weight: 0.3,
    description:
      "Assesses the formal structures, policies, and accountability mechanisms governing data as a strategic asset \u2014 the foundation for BoT compliance and BCBS 239 risk data aggregation.",
    questions: [
      "Data ownership, stewardship roles, and accountability are formally defined and enforced across all business lines",
      "Data governance policies exist, are board-approved, and are actively monitored for compliance \u2014 including alignment with Tanzania\u2019s PDPA",
      "A data catalogue or metadata management system is in use, enabling staff to discover and understand critical data assets",
      "Data lineage is tracked end-to-end for regulatory reporting and risk data aggregation (aligned to BCBS 239 requirements)",
    ],
  },
  {
    id: "dim2",
    name: "Data Architecture & Technology Infrastructure",
    icon: Database,
    dcamLabel: "DCAM Components 3 & 4 | Weight: 15%",
    weight: 0.15,
    description:
      "Evaluates the bank\u2019s technical foundation for moving, storing, and accessing data reliably \u2014 including the ability to extract trusted data from core banking systems (e.g., T24/Flexcube).",
    questions: [
      "Data extraction from core banking systems (CBS) is reliable, automated, and produces consistent, well-documented data feeds",
      "A centralised data warehouse or data lake exists and serves as the authoritative source for analytical and regulatory reporting",
      "Data integration pipelines are automated, monitored, and have documented recovery procedures for failures",
      "Cloud or hybrid infrastructure is being used in compliance with the Bank of Tanzania\u2019s 2025 Cloud Computing Guidelines",
    ],
  },
  {
    id: "dim3",
    name: "Data Quality Management",
    icon: CheckCircle,
    dcamLabel: "DCAM Component 5 | Weight: 20%",
    weight: 0.2,
    description:
      "Measures the organisation\u2019s capability to define, measure, and enforce data quality \u2014 the non-negotiable foundation on which all AI and analytics depend. Without this, AI models fail or produce harmful outputs.",
    questions: [
      "Data quality dimensions (completeness, accuracy, timeliness, consistency) are formally defined and measured for critical data assets",
      "Automated data quality checks are embedded in data pipelines and failures trigger documented remediation processes",
      "Business users trust the data they receive and act on it \u2014 there is no widespread \u201cshadow reporting\u201d in Excel",
      "Data quality issues are tracked, root-caused, and resolved through a formal issue management process with SLAs",
    ],
  },
  {
    id: "dim4",
    name: "Analytics & Business Intelligence",
    icon: BarChart2,
    dcamLabel: "DCAM Component 6 | Weight: 10%",
    weight: 0.1,
    description:
      "Assesses how effectively analytics and reporting capabilities are used to drive decisions \u2014 from basic MIS reporting to predictive analytics aligned to the bank\u2019s strategic priorities.",
    questions: [
      "Business units have access to self-service dashboards and standardised reports with consistently defined KPIs",
      "Management decisions at operational and strategic levels are regularly and demonstrably informed by data and analytics outputs",
      "Advanced analytics (customer segmentation, credit risk scoring, liquidity forecasting) are used in at least one business domain",
      "Analytics capabilities are being leveraged to harness mobile money transactional data for customer insights and credit assessment",
    ],
  },
  {
    id: "dim5",
    name: "AI & Machine Learning Capability",
    icon: Cpu,
    dcamLabel: "DCAM v2.2 AI/ML Extension + NIST AI RMF | Weight: 15%",
    weight: 0.15,
    description:
      "Evaluates the organisation\u2019s readiness to develop, deploy, and govern AI/ML models responsibly \u2014 covering model risk management aligned to SR 11-7 and the NIST AI Risk Management Framework.",
    questions: [
      "At least one AI or ML model has been developed and is operating in production with defined monitoring and performance metrics",
      "A Model Risk Management (MRM) process exists covering model validation, versioning, performance monitoring, and retraining (aligned to Federal Reserve SR 11-7 / BoT expectations)",
      "AI use cases are formally linked to strategic business outcomes with measurable KPIs (e.g., reduction in NPL, KYC processing time)",
      "Processes exist to detect, investigate, and respond to AI model failures, bias incidents, or unexpected model behaviour",
    ],
  },
  {
    id: "dim6",
    name: "Regulatory Compliance & Responsible AI",
    icon: Gavel,
    dcamLabel: "NIST AI RMF Govern Function + ISO/IEC 42001 | Weight: 10%",
    weight: 0.1,
    description:
      "Assesses whether the bank has embedded responsible AI and data compliance requirements \u2014 including Tanzania PDPA, BoT guidelines, and AI explainability \u2014 into its governance and operations.",
    questions: [
      "Tanzania\u2019s Personal Data Protection Act (PDPA) requirements are formally embedded in data collection, storage, and processing practices across all systems",
      "AI model outputs used in customer-facing decisions (e.g., loan approval, fraud flags) can be explained to regulators and customers in plain language (explainability / right-to-explanation)",
      "Regulatory reporting to the Bank of Tanzania is partially or fully automated using trusted data platform outputs",
      "An AI ethics or responsible AI policy is in place or formally in development, addressing bias, fairness, and accountability",
    ],
  },
];

const INITIAL_ANSWERS = {
  dim1: [0, 0, 0, 0],
  dim2: [0, 0, 0, 0],
  dim3: [0, 0, 0, 0],
  dim4: [0, 0, 0, 0],
  dim5: [0, 0, 0, 0],
  dim6: [0, 0, 0, 0],
};

/* =========================================================================
   HELPER FUNCTIONS
   ========================================================================= */

function getDCAMLevelLabel(score) {
  for (const level of DCAM_LEVELS) {
    if (score >= level.min && score <= level.max) return level.label;
  }
  return "Non-initiated";
}

function getScoreColor(score) {
  if (score <= 1) return COLORS.red;
  if (score <= 2) return COLORS.amber;
  if (score <= 3) return COLORS.blue;
  return COLORS.green;
}

function getScoreBg(score) {
  if (score <= 1) return "bg-red-100 text-red-700";
  if (score <= 2) return "bg-amber-100 text-amber-700";
  if (score <= 3) return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
}

function computeDimensionAverage(scores) {
  if (!scores || scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function computeWeightedAverage(answers) {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const dim of DIMENSIONS) {
    const scores = answers[dim.id];
    if (scores && scores.length > 0) {
      const avg = computeDimensionAverage(scores);
      weightedSum += avg * dim.weight;
      totalWeight += dim.weight;
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/* =========================================================================
   STYLED SUB-COMPONENTS
   ========================================================================= */

function SevenSquareLogo({ size = "text-2xl", className = "" }) {
  return (
    <span className={`font-bold ${size} ${className}`} style={{ fontFamily: "'Sora', sans-serif" }}>
      <span>7</span>
      <span>Square</span>
      <sup style={{ color: COLORS.orange, fontSize: "0.6em" }}>2</sup>
    </span>
  );
}

function LogoImages({ className = "", sizeClass = "h-10" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img
        src="/7square-logo-full.png"
        alt="7Square Inc."
        className={sizeClass}
        style={{ objectFit: "contain" }}
      />
      <div style={{ width: 1, height: 32, backgroundColor: COLORS.gold, opacity: 0.4 }} />
      <img
        src="/dataal_logo.png"
        alt="Dataal"
        className={sizeClass}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

function MethodologyBadge({ label }) {
  return (
    <span
      className="px-4 py-1.5 rounded-full text-sm font-semibold"
      style={{ backgroundColor: COLORS.navy, color: COLORS.orange, fontFamily: "'DM Mono', monospace" }}
    >
      {label}
    </span>
  );
}

/* =========================================================================
   MAIN APP COMPONENT
   ========================================================================= */

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [aiReport, setAiReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [visitedSteps, setVisitedSteps] = useState(new Set());
  const [copyTooltip, setCopyTooltip] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  /* ---- Navigation ---- */
  const goToStep = useCallback(
    (step) => {
      setVisitedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStep);
        return next;
      });
      setCurrentStep(step);
      setAnimKey((k) => k + 1);
    },
    [currentStep]
  );

  /* ---- Answer Handling ---- */
  const handleSliderChange = useCallback(
    (dimId, qIndex, value) => {
      const clamped = Math.max(0, Math.min(5, Number(value)));
      setAnswers((prev) => {
        const dimScores = [...(prev[dimId] || [0, 0, 0, 0])];
        dimScores[qIndex] = clamped;
        return { ...prev, [dimId]: dimScores };
      });
    },
    []
  );

  /* ---- Computed Scores ---- */
  const dimensionAverages = useMemo(() => {
    return DIMENSIONS.map((dim) => ({
      id: dim.id,
      name: dim.name,
      avg: computeDimensionAverage(answers[dim.id] || [0, 0, 0, 0]),
      weight: dim.weight,
      icon: dim.icon,
    }));
  }, [answers]);

  const overallScore = useMemo(() => computeWeightedAverage(answers), [answers]);

  const lowestDimension = useMemo(() => {
    let min = Infinity;
    let minId = "";
    for (const d of dimensionAverages) {
      if (d.avg < min) {
        min = d.avg;
        minId = d.id;
      }
    }
    return minId;
  }, [dimensionAverages]);

  /* ---- Radar Chart Data ---- */
  const radarData = useMemo(() => {
    return DIMENSIONS.map((dim, i) => ({
      dimension: dim.name.length > 20 ? dim.name.slice(0, 18) + "\u2026" : dim.name,
      fullName: dim.name,
      current: parseFloat(dimensionAverages[i].avg.toFixed(1)),
      target: 3.0,
    }));
  }, [dimensionAverages]);

  /* ---- AI Report Generation ---- */
  const generateReport = useCallback(async () => {
    setReportLoading(true);
    setReportError(null);
    setAiReport(null);

    const dimDetails = DIMENSIONS.map((dim, i) => {
      const scores = answers[dim.id] || [0, 0, 0, 0];
      const avg = dimensionAverages[i].avg;
      return `${i + 1}. ${dim.name} (${Math.round(dim.weight * 100)}% weight):\n   Q1=${scores[0]}, Q2=${scores[1]}, Q3=${scores[2]}, Q4=${scores[3]} | Avg: ${avg.toFixed(1)} \u2014 ${getDCAMLevelLabel(avg)}`;
    }).join("\n");

    const systemPrompt = `You are a senior Data & AI Strategy consultant at 7Square Inc., a specialist African data and AI consultancy. You produce professional, evidence-based consulting reports for C-suite banking executives in Sub-Saharan Africa. Your writing is clear, authoritative, and specific \u2014 never generic. You reference real frameworks (DCAM, NIST AI RMF, BCBS 239), real Tanzanian regulatory context (BoT, PDPA), and real African constraints (talent scarcity, legacy core banking systems, mobile money opportunity). You never use filler phrases like 'it is important to note' or 'in conclusion, we can see that'.`;

    const userPrompt = `Generate a professional Data & AI Maturity Assessment report for Co-operative Bank of Tanzania based on the following DCAM v2.2 assessment results:

DIMENSION SCORES (scale 0\u20135, DCAM levels):
${dimDetails}

WEIGHTED OVERALL SCORE: ${overallScore.toFixed(1)} / 5.0 \u2014 ${getDCAMLevelLabel(overallScore)}
AFRICA BENCHMARK CONTEXT: AfDB scores Africa's AI readiness at 32/100; most Tanzanian banks operate at DCAM Level 1\u20132.

Produce the report in these exact sections:

## Executive Summary
Two substantive paragraphs. State the overall maturity band, what it means for the bank's strategic ambitions, and the single most critical constraint to address. Reference DCAM and the African context.

## Key Findings by Dimension
One paragraph per dimension. Be specific about the score, what it means operationally, and cite one real-world implication for the bank (e.g., BCBS 239 compliance risk, regulatory reporting quality, credit scoring limitations, PDPA exposure).

## Top 3 Priority Recommendations
Three numbered recommendations, each with:
- A specific action title
- 2\u20133 sentences on what to do, how, and why it's the priority
- A realistic timeframe (90 days / 6 months / 12 months)
Make them specific to Tanzanian banking context \u2014 not generic consulting advice.

## Phased Implementation Roadmap
Phase 1 \u2014 Build the Foundation (0\u20136 months): [2\u20133 specific initiatives]
Phase 2 \u2014 Accelerate Analytics (6\u201318 months): [2\u20133 specific initiatives]
Phase 3 \u2014 Responsible AI Deployment (18\u201336 months): [2\u20133 specific initiatives]
Each phase should reference DCAM target levels and BoT compliance milestones.

## Why 7Square
Two sentences positioning 7Square as the right implementation partner. Reference DCAM methodology, African banking experience, and local Tanzanian presence. End with a confident, action-oriented closing line.`;

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      if (!res.ok) throw new Error("API response not OK");
      const data = await res.json();
      const text =
        data.content && data.content[0] && data.content[0].text
          ? data.content[0].text
          : "";
      if (!text) throw new Error("Empty response");
      setAiReport(text);
    } catch {
      setReportError(
        "Report generation encountered an issue. This is typically a temporary API connectivity problem."
      );
    } finally {
      setReportLoading(false);
    }
  }, [answers, dimensionAverages, overallScore]);

  /* ---- Download & Copy ---- */
  const downloadReport = useCallback(() => {
    if (!aiReport) return;
    const blob = new Blob([aiReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CoopBank_Tanzania_DCAM_Assessment_Report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [aiReport]);

  const copyReport = useCallback(() => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport).then(() => {
      setCopyTooltip(true);
      setTimeout(() => setCopyTooltip(false), 2000);
    });
  }, [aiReport]);

  const handleShare = useCallback(() => {
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  }, []);

  /* ===========================================================================
     RENDER: WELCOME SCREEN (STEP 0)
     =========================================================================== */
  if (currentStep === 0) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ backgroundColor: COLORS.bg, fontFamily: "'DM Sans', sans-serif" }}
        >
          <div
            className="w-full max-w-2xl text-center"
            style={{ animation: "fadeSlideIn 0.5s ease forwards" }}
          >
            {/* Logos */}
            <div className="flex justify-center mb-6">
              <LogoImages sizeClass="h-16" />
            </div>

            {/* Tagline */}
            <p
              className="text-lg italic mb-6"
              style={{ color: COLORS.gold, fontFamily: "'Sora', sans-serif" }}
            >
              Converting Africa&apos;s Challenges into Opportunities
            </p>

            {/* Divider */}
            <div className="mx-auto mb-8" style={{ width: 80, height: 3, backgroundColor: COLORS.orange, borderRadius: 2 }} />

            {/* Headline */}
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: COLORS.navy, fontFamily: "'Sora', sans-serif" }}
            >
              Data &amp; AI Maturity Assessment
            </h1>
            <p className="text-xl mb-8" style={{ color: COLORS.slate, fontFamily: "'Sora', sans-serif" }}>
              Co-operative Bank of Tanzania &mdash; DCAM-Aligned Diagnostic
            </p>

            {/* Description */}
            <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: COLORS.text }}>
              This tool measures your organisation&apos;s readiness across six capability dimensions aligned to
              the EDM Council DCAM v2.2 framework and NIST AI RMF &mdash; the global standard for financial
              services. Complete the assessment to receive an AI-generated gap analysis and phased implementation
              roadmap calibrated for the Tanzanian banking regulatory environment.
            </p>

            {/* Methodology Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <MethodologyBadge label="DCAM v2.2" />
              <MethodologyBadge label="NIST AI RMF" />
              <MethodologyBadge label="ISO/IEC 42001" />
              <MethodologyBadge label="BoT Compliant" />
            </div>

            {/* CTA Button */}
            <button
              onClick={() => goToStep(1)}
              className="px-10 py-4 rounded-lg text-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105 cursor-pointer"
              style={{ backgroundColor: COLORS.orange, fontFamily: "'Sora', sans-serif" }}
              aria-label="Begin the assessment"
            >
              Begin Assessment <ChevronRight className="inline ml-1 -mt-0.5" size={20} />
            </button>

            {/* Footer */}
            <p className="mt-12 text-sm" style={{ color: COLORS.textMuted }}>
              Powered by 7Square AI Advisory &nbsp;|&nbsp; Confidential &amp; Proprietary &nbsp;|&nbsp; Feb 2026
            </p>
          </div>

          {/* Global animation keyframes */}
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateX(20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    );
  }

  /* ===========================================================================
     RENDER: MAIN LAYOUT (STEPS 1-7)
     =========================================================================== */
  const sidebarSteps = [
    { label: "Welcome", step: 0 },
    ...DIMENSIONS.map((d, i) => ({ label: d.name, step: i + 1 })),
    { label: "Results Dashboard", step: 7 },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div
        className="min-h-screen flex"
        style={{ backgroundColor: COLORS.bg, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ================================================================
            SIDEBAR
            ================================================================ */}
        <aside
          className="w-64 min-h-screen flex flex-col justify-between shrink-0"
          style={{ backgroundColor: COLORS.navy }}
        >
          <div>
            {/* Logo */}
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <img src="/7square-logo-full.png" alt="7Square" className="h-8" style={{ objectFit: "contain" }} />
              </div>
              <SevenSquareLogo size="text-xl" className="text-white block mt-2" />
            </div>

            {/* Progress */}
            <div className="px-5 pb-4">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.gold }}>
                Progress
              </div>
              <div className="text-sm text-white mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                {Math.min(visitedSteps.size, 6)} / 6 dimensions complete
              </div>
            </div>

            {/* Nav Items */}
            <nav className="px-3">
              {sidebarSteps.map((item) => {
                const isActive = currentStep === item.step;
                const isVisited = visitedSteps.has(item.step);
                const canClick = item.step === 0 || isVisited || item.step <= currentStep;
                return (
                  <button
                    key={item.step}
                    onClick={() => canClick && goToStep(item.step)}
                    className={`w-full text-left px-3 py-2.5 rounded-md mb-0.5 text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                      canClick ? "" : "opacity-40 cursor-not-allowed"
                    }`}
                    style={{
                      backgroundColor: isActive ? "rgba(244,130,31,0.12)" : "transparent",
                      color: isActive ? COLORS.orange : COLORS.white,
                      borderLeft: isActive ? `3px solid ${COLORS.orange}` : "3px solid transparent",
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: isActive ? 600 : 400,
                    }}
                    disabled={!canClick}
                    aria-label={`Go to ${item.label}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isVisited && item.step !== 0 && item.step !== 7 && (
                      <Check size={14} style={{ color: COLORS.green }} />
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="px-5 pb-2">
            <div className="text-xs mb-3" style={{ color: COLORS.textMuted }}>
              Assessment for:
            </div>
            <div className="text-sm font-semibold text-white mb-4">
              Co-operative Bank of Tanzania
            </div>
            {/* Tanzania flag stripe */}
            <div className="flex h-1.5 rounded-full overflow-hidden">
              <div className="flex-1" style={{ backgroundColor: "#1EB53A" }} />
              <div className="flex-1" style={{ backgroundColor: "#00A3DD" }} />
              <div className="flex-1" style={{ backgroundColor: "#FCD116" }} />
              <div className="flex-1" style={{ backgroundColor: "#1A1A1A" }} />
            </div>
          </div>
        </aside>

        {/* ================================================================
            MAIN CONTENT AREA
            ================================================================ */}
        <main className="flex-1 overflow-y-auto" style={{ minHeight: "100vh" }}>
          {/* Header bar with diagonal stripe */}
          <div
            className="px-8 py-4 flex items-center justify-between"
            style={{
              backgroundColor: COLORS.navy,
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(244,130,31,0.06) 10px, rgba(244,130,31,0.06) 20px)",
            }}
          >
            <div className="flex items-center gap-4">
              <SevenSquareLogo size="text-lg" className="text-white" />
              <span className="text-sm" style={{ color: COLORS.gold }}>
                Data &amp; AI Maturity Assessment
              </span>
            </div>
            <LogoImages sizeClass="h-7" />
          </div>

          <div className="p-8" key={animKey} style={{ animation: "fadeSlideIn 0.35s ease forwards" }}>
            {/* ==============================================================
                STEPS 1-6: ASSESSMENT DIMENSIONS
                ============================================================== */}
            {currentStep >= 1 && currentStep <= 6 && (
              <DimensionStep
                dimension={DIMENSIONS[currentStep - 1]}
                stepIndex={currentStep}
                answers={answers[DIMENSIONS[currentStep - 1].id] || [0, 0, 0, 0]}
                onSliderChange={handleSliderChange}
                onNext={() => goToStep(Math.min(currentStep + 1, 7))}
                onPrev={() => goToStep(Math.max(currentStep - 1, 0))}
                isLast={currentStep === 6}
              />
            )}

            {/* ==============================================================
                STEP 7: RESULTS DASHBOARD
                ============================================================== */}
            {currentStep === 7 && (
              <ResultsDashboard
                dimensionAverages={dimensionAverages}
                overallScore={overallScore}
                lowestDimension={lowestDimension}
                radarData={radarData}
                aiReport={aiReport}
                reportLoading={reportLoading}
                reportError={reportError}
                onGenerateReport={generateReport}
                onDownload={downloadReport}
                onCopy={copyReport}
                copyTooltip={copyTooltip}
                onEditAnswers={() => goToStep(1)}
                onShare={handleShare}
                shareTooltip={shareTooltip}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${COLORS.orange};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${COLORS.orange};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]:focus {
          outline: 2px solid ${COLORS.orange};
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

/* ===========================================================================
   DIMENSION STEP COMPONENT
   =========================================================================== */

function DimensionStep({ dimension, stepIndex, answers, onSliderChange, onNext, onPrev, isLast }) {
  const DimIcon = dimension.icon;

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Dimension {stepIndex} of 6
          </span>
          <span className="text-sm" style={{ color: COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>
            {Math.round((stepIndex / 6) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#e2e8f0" }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stepIndex / 6) * 100}%`, backgroundColor: COLORS.orange }}
          />
        </div>
        {/* Step numbers */}
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: n <= stepIndex ? COLORS.orange : "#e2e8f0",
                color: n <= stepIndex ? "white" : COLORS.textMuted,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Dimension Header Card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          backgroundColor: COLORS.white,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: COLORS.slate }}
          >
            <DimIcon size={24} color="white" />
          </div>
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: COLORS.navy, fontFamily: "'Sora', sans-serif" }}
            >
              {dimension.name}
            </h2>
            <p className="text-sm mb-2" style={{ color: COLORS.orange, fontFamily: "'DM Mono', monospace" }}>
              {dimension.dcamLabel}
            </p>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {dimension.description}
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-8">
        {dimension.questions.map((q, qi) => {
          const val = answers[qi] ?? 0;
          return (
            <div
              key={qi}
              className="rounded-xl p-5"
              style={{
                backgroundColor: COLORS.white,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      backgroundColor: COLORS.slate,
                      color: "white",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Q{qi + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
                    {q}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${getScoreBg(val)}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {val}
                </span>
              </div>

              {/* Slider */}
              <div className="px-2">
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={val}
                  onChange={(e) => onSliderChange(dimension.id, qi, e.target.value)}
                  className="w-full"
                  aria-label={`Score for question ${qi + 1}: ${q}`}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={val}
                  aria-valuetext={`${val} - ${LEVEL_LABELS[val]}`}
                />
                <div className="flex justify-between mt-1">
                  {LEVEL_LABELS.map((label, li) => (
                    <span
                      key={li}
                      className="text-xs text-center"
                      style={{
                        color: li === val ? getScoreColor(li) : COLORS.textMuted,
                        fontWeight: li === val ? 700 : 400,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        maxWidth: 64,
                      }}
                    >
                      {li}<br />{label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            color: COLORS.navy,
            border: `1px solid ${COLORS.navy}`,
            backgroundColor: "transparent",
          }}
          aria-label="Go to previous step"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: COLORS.orange }}
          aria-label={isLast ? "View results dashboard" : "Go to next step"}
        >
          {isLast ? "View Results" : "Next"} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ===========================================================================
   RESULTS DASHBOARD COMPONENT
   =========================================================================== */

function ResultsDashboard({
  dimensionAverages,
  overallScore,
  lowestDimension,
  radarData,
  aiReport,
  reportLoading,
  reportError,
  onGenerateReport,
  onDownload,
  onCopy,
  copyTooltip,
  onEditAnswers,
  onShare,
  shareTooltip,
}) {
  /* ---- SECTION A: Maturity Scorecard Header ---- */
  const SectionA = (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        backgroundColor: COLORS.navy,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Overall Score */}
        <div className="text-center lg:text-left">
          <div className="text-sm uppercase tracking-wider mb-1" style={{ color: COLORS.gold }}>
            Overall Maturity Score
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl font-bold text-white"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {overallScore.toFixed(1)}
            </span>
            <span className="text-lg" style={{ color: COLORS.textMuted }}>
              / 5.0
            </span>
          </div>
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: getScoreColor(overallScore), color: "white" }}
          >
            {getDCAMLevelLabel(overallScore)}
          </span>
        </div>

        {/* Centre: Benchmark */}
        <div className="text-center px-6">
          <div className="text-sm mb-1" style={{ color: COLORS.gold, fontFamily: "'DM Mono', monospace" }}>
            Africa AI Readiness Benchmark
          </div>
          <div className="text-lg font-semibold text-white">
            32/100 (AfDB 2024)
          </div>
          <div className="text-sm italic" style={{ color: COLORS.gold }}>
            Foundation Builder
          </div>
        </div>

        {/* Right: Target */}
        <div className="text-center lg:text-right">
          <div className="text-sm mb-1" style={{ color: COLORS.gold }}>
            Recommended Target
          </div>
          <div className="text-lg font-semibold text-white">
            Level 3 &mdash; Defined
          </div>
          <div className="text-sm" style={{ color: COLORS.textMuted }}>
            18-month horizon
          </div>
        </div>
      </div>
    </div>
  );

  /* ---- SECTION B: Radar Chart + Score Cards ---- */
  const SectionB = (
    <div className="flex flex-col lg:flex-row gap-6 mb-6">
      {/* Radar Chart */}
      <div
        className="lg:w-3/5 rounded-xl p-6"
        style={{
          backgroundColor: COLORS.white,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: COLORS.navy, fontFamily: "'Sora', sans-serif" }}
        >
          Capability Maturity Profile &mdash; DCAM v2.2 Assessment
        </h3>
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: COLORS.textMuted }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: COLORS.textMuted }} tickCount={6} />
            <Radar
              name="Current State"
              dataKey="current"
              stroke={COLORS.navy}
              fill={COLORS.navy}
              fillOpacity={0.3}
            />
            <Radar
              name="Target State (Level 3)"
              dataKey="target"
              stroke={COLORS.orange}
              fill="none"
              strokeDasharray="5 5"
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Cards Grid */}
      <div className="lg:w-2/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensionAverages.map((dim) => {
          const Icon = dim.icon;
          const isPriority = dim.id === lowestDimension;
          return (
            <div
              key={dim.id}
              className="rounded-xl p-4 relative"
              style={{
                backgroundColor: COLORS.white,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                borderLeft: isPriority ? `3px solid ${COLORS.orange}` : "3px solid transparent",
              }}
            >
              {isPriority && (
                <span
                  className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: COLORS.orange, color: "white" }}
                >
                  Priority
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color: COLORS.slate }} />
                <span className="text-xs font-semibold truncate" style={{ color: COLORS.navy }}>
                  {dim.name}
                </span>
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "'DM Mono', monospace", color: getScoreColor(dim.avg) }}
              >
                {dim.avg.toFixed(1)}{" "}
                <span className="text-sm font-normal" style={{ color: COLORS.textMuted }}>
                  / 5.0
                </span>
              </div>
              <div className="text-xs mb-2" style={{ color: COLORS.textMuted }}>
                {getDCAMLevelLabel(dim.avg)}
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "#e2e8f0" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(dim.avg / 5) * 100}%`,
                    backgroundColor: getScoreColor(dim.avg),
                  }}
                />
              </div>
              <div
                className="text-xs mt-2 px-2 py-0.5 rounded inline-block"
                style={{ backgroundColor: "#f1f5f9", color: COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}
              >
                {Math.round(dim.weight * 100)}% weight
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ---- SECTION C: AI Report ---- */
  const SectionC = (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        backgroundColor: COLORS.white,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/7square-logo-full.png" alt="7Square" className="h-6" style={{ objectFit: "contain" }} />
          <h3
            className="text-lg font-bold"
            style={{ color: COLORS.navy, fontFamily: "'Sora', sans-serif" }}
          >
            7Square AI-Generated Assessment Report
          </h3>
        </div>
        {aiReport && (
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={{ border: `1px solid ${COLORS.navy}`, color: COLORS.navy, backgroundColor: "transparent" }}
              aria-label="Download report as text file"
            >
              <Download size={14} /> Download (.txt)
            </button>
            <div className="relative">
              <button
                onClick={onCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{ border: `1px solid ${COLORS.navy}`, color: COLORS.navy, backgroundColor: "transparent" }}
                aria-label="Copy report to clipboard"
              >
                <Copy size={14} /> Copy
              </button>
              {copyTooltip && (
                <span
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                  style={{ backgroundColor: COLORS.green }}
                >
                  Copied!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate button or report content */}
      {!aiReport && !reportLoading && !reportError && (
        <div className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>
            Generate a comprehensive gap analysis and implementation roadmap powered by AI.
          </p>
          <button
            onClick={onGenerateReport}
            className="px-10 py-4 rounded-lg text-lg font-semibold text-white transition-all duration-200 hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: COLORS.navy }}
            aria-label="Generate AI assessment report"
          >
            Generate Report
          </button>
        </div>
      )}

      {reportLoading && (
        <div className="text-center py-16">
          <Loader2
            size={40}
            style={{ color: COLORS.orange, animation: "spin 1s linear infinite" }}
            className="mx-auto mb-4"
          />
          <p className="text-sm" style={{ color: COLORS.text }}>
            Analysing Co-operative Bank of Tanzania&apos;s Data &amp; AI maturity against DCAM v2.2 and NIST AI RMF benchmarks
            <span className="inline-block" style={{ animation: "pulse 1.5s infinite" }}>...</span>
          </p>
          <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
        </div>
      )}

      {reportError && (
        <div
          className="rounded-lg p-6 text-center"
          style={{ border: `2px solid ${COLORS.orange}`, backgroundColor: COLORS.navy }}
        >
          <AlertCircle size={32} style={{ color: COLORS.orange }} className="mx-auto mb-3" />
          <p className="text-sm text-white mb-4">{reportError}</p>
          <button
            onClick={onGenerateReport}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: COLORS.orange, color: "white" }}
            aria-label="Retry report generation"
          >
            Retry
          </button>
        </div>
      )}

      {aiReport && (
        <div
          className="max-w-none"
          style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}
        >
          {aiReport.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="text-lg font-bold mt-8 mb-3 pl-4"
                  style={{
                    color: COLORS.navy,
                    fontFamily: "'Sora', sans-serif",
                    borderLeft: `3px solid ${COLORS.orange}`,
                  }}
                >
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3
                  key={i}
                  className="text-base font-bold mt-6 mb-2"
                  style={{ color: COLORS.slate, fontFamily: "'Sora', sans-serif" }}
                >
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("**Phase") || (line.startsWith("**") && line.includes("**"))) {
              return (
                <p key={i} className="mb-2 leading-relaxed font-semibold text-sm">
                  {renderBoldText(line)}
                </p>
              );
            }
            if (line.trim() === "") return <div key={i} className="h-2" />;
            return (
              <p key={i} className="mb-2 leading-relaxed text-sm">
                {renderBoldText(line)}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ---- SECTION D: Bottom Action Bar ---- */
  const SectionD = (
    <div
      className="sticky bottom-0 rounded-xl p-4 flex items-center justify-between"
      style={{
        backgroundColor: COLORS.white,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <button
        onClick={onEditAnswers}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
        style={{ color: COLORS.navy, border: `1px solid ${COLORS.navy}`, backgroundColor: "transparent" }}
        aria-label="Edit assessment answers"
      >
        <ChevronLeft size={16} /> Edit Answers
      </button>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{ color: COLORS.navy, border: `1px solid ${COLORS.navy}`, backgroundColor: "transparent" }}
            aria-label="Share assessment"
          >
            <Share2 size={14} /> Share Assessment
          </button>
          {shareTooltip && (
            <span
              className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: COLORS.green }}
            >
              Link copied to clipboard
            </span>
          )}
        </div>
        <a
          href="mailto:enquiries@dataalafrica.com"
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 no-underline"
          style={{ backgroundColor: COLORS.orange }}
          aria-label="Book a consultation"
        >
          <Mail size={14} /> Book a Consultation
        </a>
      </div>
    </div>
  );

  return (
    <div>
      {SectionA}
      {SectionB}
      {SectionC}
      {SectionD}
    </div>
  );
}

/* ===========================================================================
   UTILITY: Render bold markdown text
   =========================================================================== */
function renderBoldText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: COLORS.navy }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
