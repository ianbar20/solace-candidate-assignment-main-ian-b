"use client";
import { useEffect, useMemo, useState } from "react";
import Select, { MultiValue, SingleValue } from "react-select";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import type { Advocate } from "./api/advocates/route";
import { formatPhone, stateMap } from "./utils/utilities";
import AdvocateModal from "@/components/AdvocateModal";
import { specialties } from "@/db/seed/advocates";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filtered, setFiltered] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/advocates")
      .then((res) => res.json())
      .then(({ data }) => {
        setAdvocates(data);
        setFiltered(data);
        setIsLoaded(true);
      })
      .catch(console.error);
  }, []);

  const stateOptions = useMemo(
    () =>
      Object.entries(stateMap).map(([abbr, name]) => ({
        value: abbr,
        label: name,
      })),
    []
  );

  const specialtyOptions = useMemo(
    () => specialties.map((s) => ({ value: s, label: s })),
    []
  );

  const applyFilters = (term: string, state: string, specialties: string[]) => {
    const lower = term.toLowerCase();

    const results = advocates.filter((adv) => {
      const matchesSearch =
        adv.firstName.toLowerCase().includes(lower) ||
        adv.lastName.toLowerCase().includes(lower) ||
       `${adv.firstName} ${adv.lastName}, ${adv.degree}`.toLowerCase().includes(lower) ||
        adv.city.toLowerCase().includes(lower) ||
        adv.state.toLowerCase().includes(lower) ||
        adv.degree.toLowerCase().includes(lower);

      const matchesState = !state || adv.state === state;
      const matchesSpecialties =
        specialties.length === 0 ||
        specialties.every((selected) => adv.specialties.includes(selected));

      return matchesSearch && matchesState && matchesSpecialties;
    });

    setFiltered(results);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, selectedState, selectedSpecialties);
  };

  const handleStateChange = (
    selected: SingleValue<{ value: string; label: string }>
  ) => {
    const state = selected?.value ?? "";
    setSelectedState(state);
    applyFilters(searchTerm, state, selectedSpecialties);
  };

  const handleSpecialtiesChange = (
    selected: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selected.map((s) => s.value);
    setSelectedSpecialties(values);
    applyFilters(searchTerm, selectedState, values);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedState("");
    setSelectedSpecialties([]);
    setFiltered(advocates);
  };

  return (
    <main className="h-screen flex flex-col bg-gradient-to-t from-primary-accent to-white p-6 z-0">
      <div className="shrink-0">
        <h1
          className="text-5xl mb-6 text-primary-bg text-center"
          style={{
            fontFamily: "'Mollie Glaston', cursive",
          }}
        >
          Solace Advocates
        </h1>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap relative z-50">
          <div className="flex flex-col flex-grow min-w-[250px] sm:max-w-md">
            <input
              id="search"
              aria-label="Search advocate name or location..."
              type="text"
              className="bg-white border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-accent"
              value={searchTerm}
              onChange={handleChange}
              placeholder="Search name or location..."
            />
          </div>

          <div className="flex flex-col sm:w-64 z-[60]">
            <Select
              inputId="state-select"
              aria-label="Filter by state"
              isMulti={false}
              options={stateOptions}
              value={
                selectedState
                  ? stateOptions.find((opt) => opt.value === selectedState)
                  : null
              }
              onChange={handleStateChange}
              placeholder="Select a state..."
              isClearable
            />
          </div>

          <div className="flex flex-col sm:w-64 z-[60]">
            <Select
              inputId="specialty-select"
              aria-label="Filter by specialties"
              isMulti
              options={specialtyOptions}
              value={selectedSpecialties.map((s) => ({ value: s, label: s }))}
              onChange={handleSpecialtiesChange}
              placeholder="Filter by specialties..."
              isClearable={false}
            />
          </div>

          <button
            onClick={handleReset}
            className="bg-primary-bg text-white px-4 py-2 rounded-md hover:bg-primary-accent transition w-fit"
            aria-label="Reset all filters"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-auto rounded-md">
        {!isLoaded ? (
          <p role="status" className="text-center text-sm text-gray-500 mt-10">
            Loading advocates...
          </p>
        ) : filtered.length < 1 ? (
          <section
            className="flex flex-col items-center justify-center text-center text-primary-text mt-20"
            role="status"
          >
            <p className="text-lg font-semibold">No matching advocates found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or resetting the filter.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 bg-primary-bg text-white px-4 py-2 rounded-md hover:bg-primary-accent transition"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
          </section>
        ) : (
          <table className="min-w-full table-fixed bg-white border border-border">
            <thead className="bg-primary-bg text-white sticky top-0 z-40">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-semibold uppercase"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-semibold uppercase"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-semibold uppercase w-[120px]"
                >
                  Experience
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-semibold uppercase w-[240px]"
                >
                  Specialties
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-semibold uppercase"
                >
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((adv) => (
                <tr
                  key={adv.phoneNumber}
                  className="even:bg-light cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setSelectedAdvocate(adv)}
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    {adv.firstName} {adv.lastName}, {adv.degree}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {adv.city}, {adv.state}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {adv.yearsOfExperience}{" "}
                    {adv.yearsOfExperience === 1 ? "year" : "years"}
                  </td>
                  <td className="px-4 py-2 max-w-[200px] truncate">
                    <Tippy
                      content={
                        <span
                          className="text-xs"
                          role="tooltip"
                          aria-label={`Specialties: ${adv.specialties.join(
                            ", "
                          )}`}
                        >
                          {adv.specialties.join(", ")}
                        </span>
                      }
                      placement="bottom-start"
                    >
                      <span
                        className="truncate block cursor-default"
                        tabIndex={0}
                        aria-describedby={`tooltip-${adv.phoneNumber}`}
                        id={`tooltip-${adv.phoneNumber}`}
                      >
                        {adv.specialties.join(", ")}
                      </span>
                    </Tippy>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatPhone(adv.phoneNumber)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedAdvocate && (
        <AdvocateModal
          advocate={selectedAdvocate}
          onClose={() => setSelectedAdvocate(null)}
        />
      )}
    </main>
  );
}
