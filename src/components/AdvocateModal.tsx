"use client";
import { formatPhone } from "@/app/utils/utilities";
import type { Advocate } from "../app/api/advocates/route";

type AdvocateModalProps = {
  advocate: Advocate;
  onClose: () => void;
};

export default function AdvocateModal({
  advocate,
  onClose,
}: AdvocateModalProps) {

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advocate-modal-title"
      aria-describedby="advocate-modal-description"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md p-6 relative animate-fadeIn"
        // prevent click within modal from closing 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          ✕
        </button>
        <h2
          id="advocate-modal-title"
          className="text-xl font-semibold mb-4"
        >
          {advocate.firstName} {advocate.lastName}, {advocate.degree}
        </h2>
        <div
          id="advocate-modal-description"
          className="space-y-2 text-sm text-primary-text"
        >
          <p>
            <strong>Location:</strong> {advocate.city}, {advocate.state}
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${advocate.phoneNumber}`} className="underline text-blue-600">
              {formatPhone(advocate.phoneNumber)}
            </a>
          </p>
          <p>
            <strong>Experience:</strong> {advocate.yearsOfExperience}{" "}
            {advocate.yearsOfExperience === 1 ? "year" : "years"}
          </p>
          <div>
            <strong>Specialties:</strong>
            <ul className="flex flex-wrap gap-2 mt-2" aria-label="Specialties list">
              {advocate.specialties.map((specialty, index) => (
                <li
                  key={index}
                  className="bg-primary-accent text-white text-xs px-3 py-1 rounded-full"
                >
                  {specialty}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
