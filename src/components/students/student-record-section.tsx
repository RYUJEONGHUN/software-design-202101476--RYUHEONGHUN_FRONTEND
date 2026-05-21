import { useEffect, useMemo, useState } from "react";
import {
  getStudentRecords,
  saveStudentRecord,
  type SaveStudentRecordRequest,
  type StudentRecord,
} from "@/api/student";
import {
  getAccessToken,
  getRoleFromToken,
  type AppRole,
} from "@/lib/auth";

type Props = {
  studentId: string | number;
};

type FormState = SaveStudentRecordRequest;

const currentYear = new Date().getFullYear();
const emptyForm: FormState = {
  schoolYear: currentYear,
  semester: "1",
  specialNote: "",
  behaviorNote: "",
  careerHope: "",
  healthNote: "",
};

function canSaveRecord(role: AppRole | null) {
  return role === "ROLE_TEACHER" || role === "ROLE_ADMIN";
}

function getRole() {
  const token = getAccessToken();
  return token ? getRoleFromToken(token) : null;
}

function formatSemester(value: string) {
  if (value === "1" || value === "2") return `${value}학기`;
  return value;
}

function parseSemester(value: string) {
  const match = value.match(/^(\d{4})-(.+)$/);
  if (!match) return null;

  return {
    schoolYear: Number(match[1]),
    semester: match[2],
  };
}

function getRecordSchoolYear(record: StudentRecord) {
  if (record.schoolYear >= 1900) return record.schoolYear;
  return parseSemester(record.semester)?.schoolYear ?? record.schoolYear;
}

function getRecordSemester(record: StudentRecord) {
  return parseSemester(record.semester)?.semester ?? record.semester;
}

export default function StudentRecordSection({ studentId }: Props) {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const role = getRole();
  const writable = canSaveRecord(role);

  const selectedRecord = useMemo(
    () =>
      records.find(
        (record) =>
          getRecordSchoolYear(record) === form.schoolYear &&
          getRecordSemester(record) === form.semester
      ) ?? null,
    [records, form.schoolYear, form.semester]
  );

  const schoolYearOptions = useMemo(() => {
    const years = new Set<number>([currentYear, form.schoolYear]);
    records.forEach((record) => years.add(getRecordSchoolYear(record)));
    return [...years].sort((a, b) => b - a);
  }, [records, form.schoolYear]);

  const semesterOptions = useMemo(() => {
    const semesters = new Set<string>(["1", "2", form.semester]);
    records.forEach((record) => semesters.add(getRecordSemester(record)));
    return [...semesters].sort();
  }, [records, form.semester]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentRecords(studentId);
      setRecords(data);

      if (data.length > 0) {
        const latest = [...data].sort((a, b) => {
          const aYear = getRecordSchoolYear(a);
          const bYear = getRecordSchoolYear(b);

          if (aYear !== bYear) return bYear - aYear;
          return getRecordSemester(b).localeCompare(getRecordSemester(a));
        })[0];

        setForm({
          schoolYear: getRecordSchoolYear(latest),
          semester: getRecordSemester(latest),
          specialNote: latest.specialNote ?? "",
          behaviorNote: latest.behaviorNote ?? "",
          careerHope: latest.careerHope ?? "",
          healthNote: latest.healthNote ?? "",
        });
      } else {
        setForm(emptyForm);
      }
    } catch (err) {
      console.error(err);
      setError("학생부 기록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [studentId]);

  const updateForm = (key: keyof FormState, value: string | number) => {
    setMessage("");
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectPeriod = (schoolYear: number, semester: string) => {
    setMessage("");

    const nextRecord = records.find(
      (record) =>
        getRecordSchoolYear(record) === schoolYear &&
        getRecordSemester(record) === semester
    );

    setForm({
      schoolYear,
      semester,
      specialNote: nextRecord?.specialNote ?? "",
      behaviorNote: nextRecord?.behaviorNote ?? "",
      careerHope: nextRecord?.careerHope ?? "",
      healthNote: nextRecord?.healthNote ?? "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await saveStudentRecord(studentId, form);
      setMessage("학생부 기록이 저장되었습니다.");
      await fetchRecords();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "학생부 기록 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            학생부 기록
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            학년도와 학기를 선택해 학생부 기록을 확인하고 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={form.schoolYear}
            onChange={(event) =>
              handleSelectPeriod(Number(event.target.value), form.semester)
            }
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
          >
            {schoolYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}학년도
              </option>
            ))}
          </select>

          <select
            value={form.semester}
            onChange={(event) =>
              handleSelectPeriod(form.schoolYear, event.target.value)
            }
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
          >
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                {formatSemester(semester)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-5 py-12 text-center text-sm text-slate-400">
          학생부 기록을 불러오는 중...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            {records.length > 0 ? (
              records.map((record) => {
                const recordSchoolYear = getRecordSchoolYear(record);
                const recordSemester = getRecordSemester(record);
                const active =
                  recordSchoolYear === form.schoolYear &&
                  recordSemester === form.semester;

                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() =>
                      handleSelectPeriod(recordSchoolYear, recordSemester)
                    }
                    className={`w-full rounded-[20px] border px-4 py-3 text-left transition ${
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {recordSchoolYear}학년도 {formatSemester(recordSemester)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {record.specialNote || "특이사항 없음"}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                등록된 기록이 없습니다.
              </div>
            )}
          </div>

          <div className="space-y-4">
            {!selectedRecord && (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                선택한 학년도/학기 기록이 없습니다. 새 기록으로 저장됩니다.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  학년도
                </label>
                <input
                  type="number"
                  value={form.schoolYear}
                  onChange={(event) =>
                    updateForm("schoolYear", Number(event.target.value))
                  }
                  disabled={!writable}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  학기
                </label>
                <input
                  value={form.semester}
                  onChange={(event) => updateForm("semester", event.target.value)}
                  disabled={!writable}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextareaField
                label="특이사항"
                value={form.specialNote}
                disabled={!writable}
                onChange={(value) => updateForm("specialNote", value)}
              />
              <TextareaField
                label="행동 특성"
                value={form.behaviorNote}
                disabled={!writable}
                onChange={(value) => updateForm("behaviorNote", value)}
              />
              <TextareaField
                label="진로 희망"
                value={form.careerHope}
                disabled={!writable}
                onChange={(value) => updateForm("careerHope", value)}
              />
              <TextareaField
                label="건강 기록"
                value={form.healthNote}
                disabled={!writable}
                onChange={(value) => updateForm("healthNote", value)}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {writable && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "저장 중..." : "학생부 저장"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

function TextareaField({
  label,
  value,
  disabled,
  onChange,
}: TextareaFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={4}
        className="min-h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}
