import Banner from "../components/Banner";

export default function About() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-[#1e293b]">About This Project</h1>
        <p className="mt-3 text-slate-700 max-w-6xl">
        Routine analysis of cerebrospinal fluid (CSF) is a critical diagnostic procedure for detecting inflammatory and malignant diseases of the central nervous system (CNS). 
        To support both clinical research and data-driven exploration, ETH Zurich developed this application to make machine learning models accessible to clinicians and researchers.
        
        </p>
      </section>

      {/* Team: Should we add pictures here?*/}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-semibold text-[#1e293b]">Team</h2>
        <ul className="list-disc list-inside text-sm text-slate-700 leading-6">
          <li>Names & roles </li>
          <li>Supervisors / lab</li>
          <li>Partner (Addama) and scope</li>
        </ul>
      </section>

      {/* Methods snapshot */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-semibold text-[#1e293b]">Methods Overview</h2>
        <p className="text-sm text-slate-700">
        Users can upload or manually enter CSF laboratory measurements to obtain automated predictions 
        and model-generated explanations, enabling exploratory insight into disease patterns while maintaining data confidentiality.

        </p>
        {/* <Banner tone="info" title="Limitations (Snapshot)">
          Maybe add information about limitations, or future work directions.
        </Banner> */}
      </section>

      {/* Contact / Acknowledgements */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-[#1e293b]">Acknowledgements & Contact</h2>
        <p className="text-sm text-slate-700 mt-2">
          Information about the lab, and contact. 
        </p>
      </section>
    </div>
  );
}