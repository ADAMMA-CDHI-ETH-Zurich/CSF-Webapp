import Banner from "../components/Banner";
import InfoCard from "../components/InfoCard";
import { ShieldAlert, BookOpen, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1e293b]">
          Welcome to <span className="text-[#1e293b]">The Medical Dashboard</span>
        </h1>
        <p className="mt-3 text-slate-700 max-w-2xl">
          Short one-liner about the project. Explain the dashboard purpose in one or two sentences.
        </p>

        {/* Research disclaimer banner => perhaps better in blue?*/}
        <div className="mt-6">
          <Banner tone="warn" title="Research Disclaimer">
            This tool is intended for research and educational use only. It is not designed for
            clinical diagnosis or treatment. Results should be interpreted within a research context.
            Please consult a qualified healthcare professional for medical advice.
          </Banner>
        </div>
      </section>

      {/* Key sections (3-up) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          icon={<Activity className="w-5 h-5 text-[#1e293b]" />}
          title="What it does"
          footer="notes"
        >
          Brief explanation of the model/dashboard and high-level outputs (prediction + SHAP).
        </InfoCard>

        <InfoCard
          icon={<BookOpen className="w-5 h-5 text-[#1e293b]" />}
          title="How it works"
          footer="Link to methods or docs maybe to the paper?"
        >
          One paragraph on data input (PDF/manual), processing, and visual explanations.
          Possibly link to the classifier page. 
        </InfoCard>

        <InfoCard
          icon={<ShieldAlert className="w-5 h-5 text-[#1e293b]" />}
          title="Data & Privacy"
          footer="Maybe add a link later"
        >
          Short statement about handling of uploaded PDFs and transient processing.
        </InfoCard>
      </section>

      {/* Publication / Credits */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-semibold text-[#1e293b]">Publication & Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-sm text-slate-700 leading-6">
            <p>
              Here we can include some information about the publication, and perhaps link to the github source code
            </p>
            <p className="mt-2">
              <span className="font-medium">Contributors: </span>
              Names, affiliations (ETH / ADAMMA), and collaborators.
            </p>
          </div>
          <div>
            <Banner tone="notice" title="Source Code">
              GitHub link and instructions (coming soon). Provide info for reproducibility.
            </Banner>
          </div>
        </div>
      </section>
    </div>
  );
}
