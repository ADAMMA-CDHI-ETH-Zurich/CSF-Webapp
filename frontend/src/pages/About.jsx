import Banner from "../components/Banner";

export default function About() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
        <h1 className="text-xl font-semibold text-[#1e293b]">About This Application</h1>
        <p className="mt-3 text-slate-700 max-w-6xl">
        Routine analysis of cerebrospinal fluid (CSF) plays a vital role in diagnosing inflammatory and malignant disorders of the central nervous system (CNS). 
        <p>To support both clinical research and data-driven exploration, ETH Zurich developed this application to make machine learning models accessible to clinicians and researchers.</p><br />      
        <p>The platform builds upon the research article <strong>"Explainable Artificial Intelligence Enhances The Diagnostic Performance of Routine Cerebrospinal Fluid Analysis 
        For Malignant and Inflammatory Diseases of The Central Nervous System"</strong>, a joint work between the ADAMMA Research Group at ETH Zurich and clinicians from the University Hospital Zurich (USZ). </p>
        </p>
      </section>

      {/* Methods snapshot */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-semibold text-[#1e293b]">Model Interaction and Data Handling</h2>
        <p className="mt-3 text-slate-700 max-w-6xl">
        This application enables the upload of CSF laboratory data in PDF format or manual data entry to produce automated model predictions accompanied by 
        feature-based interpretability outputs, thereby supporting the exploratory investigation of disease patterns in compliance with stringent data protection principles.

        </p>
        {/* <Banner tone="info" title="Limitations (Snapshot)">
          Maybe add information about limitations, or future work directions.
        </Banner> */}
      </section>

      {/* Team: Should we add pictures here?*/}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-[#1e293b]">Team (TBD)</h2>
        {/* Inner boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Clinicians - University Hospital Zurich</h3>
            <ul className="text-sm text-slate-700 leading-6 list-disc list-inside">
              <li>PD Dr. med. Dr. sc. nat. Tobias Weiss</li>
              <li>Dr. med. Claudio Togni</li>
              <li>Dr. med. Nils Briel</li>
              <li>Dr. D. Placeholder</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-4  space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Researchers - ETH Zurich</h3>
            <ul className="text-sm text-slate-700 leading-6 list-disc list-inside">
              <li>Prof. Dr. Elgar Fleisch</li>
              <li>Dr. Filipe Barata</li>
              <li>Dr. Fan Wu</li>
              <li>Mesut Ceylan</li>
            </ul>
          </div>
        </div>
    </section>

      {/* Contact / Acknowledgements */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-[#1e293b]">Contact</h2>
        <p className="mt-3 text-slate-700 max-w-6xl">
        <p>For technical inquiries, research collaborations, or feedback, please contact:</p>
        <p>Mesut Ceylan, ADAMMA Group, ETH Zurich. </p>
 
        </p>
      </section>
    </div>
  );
}