import Banner from "../components/Banner";
import InfoCard from "../components/InfoCard";
import { ShieldAlert, BookOpen, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1e293b]">
          <span className="block text-center text-[#1e293b]">Zurich Classifier</span>
        </h1>
        <p className="mt-3">
        The <i>Zurich Classifier</i> is a joint research initiative of the University Hospital Zurich and ETH Zurich. It is designed to advance cerebrospinal fluid (CSF) 
        diagnostics by serving as a research platform for machine learning–based analyses of CSF data. 
        It enables users to evaluate automated prediction models and interpret feature-level contributions, 
        offering a secure environment for data-driven exploration of inflammatory and malignant diseases affecting the central nervous system (CNS).
        </p>

        {/* Research disclaimer banner => perhaps better in blue?*/}
        <div className="mt-3">
          <Banner tone="warn" title="Research Disclaimer">
          The application is intended <strong>solely for research purposes and must not be used for clinical diagnosis or patient management.</strong> 
          The predictions are provided for <strong>exploratory insights only </strong> and should be interpreted within a research context. 
          For medical advice, please consult a qualified healthcare professional.
          </Banner>
        </div>
      </section>

      {/* Key sections (3-up) */}
      <div className="bg-white border rounded-2xl p-5 md:p-6 shadow-lg">
      <h2 className="block text-center text-lg md:text-2xl font-semibold text-[#1e293b] mb-4">Main Features</h2>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          icon={<Activity className="w-5 h-5 text-[#1e293b]" />}
          title="Interpretable CSF Disease Classification"
          // footer="notes"
        >
          The <i>Zurich Classifier</i> assigns CSF profiles into inflammatory and 
          malignant CNS disease categories and provides feature explanations through SHAP values.

        </InfoCard>

        <InfoCard
          icon={<BookOpen className="w-5 h-5 text-[#1e293b]" />}
          title="Input Your Data, Get Predictions"
          // footer="Link to methods or docs maybe to the paper?"
        >
          Users can provide CSF lab measurements via PDF upload or manual entry, validate the input values, and generate model predictions and explanations.
        </InfoCard>

        <InfoCard
          icon={<ShieldAlert className="w-5 h-5 text-[#1e293b]" />}
          title="Privacy by Design"
          // footer="Maybe add a link later"
        >
          The application does not store or transmit any user data.
          All user data are processed temporarily and handled in accordance with data protection standards.           
        </InfoCard>
      </section>
      </div>
      {/* button and video */}
      <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <Link
          to="/classifier"
          className="inline-flex items-center px-8 py-4 rounded-2xl bg-[#233e62] text-white hover:bg-[#1b304f] transition"
        >
          Launch Classifier
        </Link>

        <video
          className="w-full max-w-6xl rounded-xl border border-gray-200 shadow-sm"
          controls
          // poster="/videos/preview.jpg" // optional
        >
          <source src="demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      </div>
      {/* Publication / Credits */}
      {/* M:We wont show these two right now so I commented out */}
      {/* <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-4">
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
      </section> */}
    </div>
  );
}