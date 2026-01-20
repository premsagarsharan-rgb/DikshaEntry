"use client";

import { useEffect, useState } from "react";

const RELATIONS = ["Father", "Mother", "Husband"];
const GENDER = ["Male", "Female", "Other"];
const MARITAL = ["Married", "Unmarried", "Divorcee", "Saadhu"];
const IDTYPES = ["Aadhaar", "PAN Card", "Passport", "Voter ID"];

export default function DevoteeForm({ initialData, onSave, saveLabel = "Save" }) {
  const [data, setData] = useState(() => initialData || {});
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    setData(initialData || {});
  }, [initialData]);

  async function autoLocation() {
    setLocLoading(true);
    try {
      const r = await fetch("https://ipapi.co/json/");
      const d = await r.json();
      setData((p) => ({
        ...p,
        country: p.country || d.country_name || "",
        state: p.state || d.region || "",
        city: p.city || d.city || "",
      }));
    } catch (e) {
      console.error("[autoLocation] error", e);
    } finally {
      setLocLoading(false);
    }
  }

  function setField(k, v) {
    setData((p) => ({ ...p, [k]: v }));
  }

  function updateFamily(idx, k, v) {
    const family = Array.isArray(data.family) ? [...data.family] : [];
    family[idx] = { ...(family[idx] || {}), [k]: v };
    setData((p) => ({ ...p, family }));
  }

  function addFamily() {
    const family = Array.isArray(data.family) ? [...data.family] : [];
    family.push({ name: "", relation: "", mobileNumber: "" });
    setData((p) => ({ ...p, family }));
  }

  function removeFamily(idx) {
    const family = Array.isArray(data.family) ? [...data.family] : [];
    family.splice(idx, 1);
    setData((p) => ({ ...p, family }));
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Full Name"
          value={data.fullName || ""}
          onChange={(e) => setField("fullName", e.target.value)}
        />

        <select className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          value={data.relation || "Husband"}
          onChange={(e) => setField("relation", e.target.value)}
        >
          {RELATIONS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>

        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Relation Name"
          value={data.relationName || ""}
          onChange={(e) => setField("relationName", e.target.value)}
        />

        <select className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          value={data.gender || "Male"}
          onChange={(e) => setField("gender", e.target.value)}
        >
          {GENDER.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>

        <select className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          value={data.maritalStatus || "Married"}
          onChange={(e) => setField("maritalStatus", e.target.value)}
        >
          {MARITAL.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>

        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 md:col-span-2"
          placeholder="Address"
          value={data.address || ""}
          onChange={(e) => setField("address", e.target.value)}
        />

        <div className="md:col-span-2 flex items-center justify-between">
          <div className="text-sm text-zinc-300">Location (Auto Fetch Online)</div>
          <button type="button" onClick={autoLocation} className="text-sm rounded-lg border border-zinc-700 px-3 py-1 hover:bg-zinc-800">
            {locLoading ? "Fetching..." : "Auto Fetch"}
          </button>
        </div>

        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Country"
          value={data.country || ""}
          onChange={(e) => setField("country", e.target.value)}
        />
        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="State"
          value={data.state || ""}
          onChange={(e) => setField("state", e.target.value)}
        />
        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="City"
          value={data.city || ""}
          onChange={(e) => setField("city", e.target.value)}
        />

        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Profession"
          value={data.profession || ""}
          onChange={(e) => setField("profession", e.target.value)}
        />
        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Mobile Number"
          value={data.mobileNumber || ""}
          onChange={(e) => setField("mobileNumber", e.target.value)}
        />
        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="WhatsApp Number"
          value={data.whatsappNumber || ""}
          onChange={(e) => setField("whatsappNumber", e.target.value)}
        />

        <select className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          value={data.idType || "Aadhaar"}
          onChange={(e) => setField("idType", e.target.value)}
        >
          {IDTYPES.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>

        <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="ID Number"
          value={data.idNumber || ""}
          onChange={(e) => setField("idNumber", e.target.value)}
        />

        <label className="md:col-span-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!data.confirm}
            onChange={(e) => setField("confirm", e.target.checked)}
          />
          I confirm details are correct (mandatory)
        </label>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Family Members</h3>
          <button type="button" onClick={addFamily} className="rounded-lg border border-zinc-700 px-3 py-1 hover:bg-zinc-800">
            + Add
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {(data.family || []).map((f, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="grid md:grid-cols-3 gap-3">
                <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                  placeholder="Name"
                  value={f.name || ""}
                  onChange={(e) => updateFamily(idx, "name", e.target.value)}
                />
                <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                  placeholder="Relation"
                  value={f.relation || ""}
                  onChange={(e) => updateFamily(idx, "relation", e.target.value)}
                />
                <input className="rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                  placeholder="Mobile Number"
                  value={f.mobileNumber || ""}
                  onChange={(e) => updateFamily(idx, "mobileNumber", e.target.value)}
                />
              </div>
              <button type="button" onClick={() => removeFamily(idx)} className="mt-2 text-sm text-red-400">
                Remove
              </button>
            </div>
          ))}
          {!data.family?.length ? (
            <div className="text-sm text-zinc-400">No family members added.</div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSave(data)}
        className="mt-6 w-full rounded-xl bg-white text-black font-semibold p-3"
      >
        {saveLabel}
      </button>
    </div>
  );
}
