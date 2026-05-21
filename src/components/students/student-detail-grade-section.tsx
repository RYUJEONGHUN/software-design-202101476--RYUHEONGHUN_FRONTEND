import { useEffect, useState } from "react";
import { updateGrade } from "@/api/grade";
import { getTeacherDashboard } from "@/api/teacher";
import type { StudentDetailResponse, SubjectScore } from "@/types/student";

type Props = {
  student: StudentDetailResponse;
  onRefresh: () => Promise<void>;
};

export default function StudentDetailGradeSection({
  student,
  onRefresh,
}: Props) {
  const [teacherSubjectName, setTeacherSubjectName] = useState("");
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const data = await getTeacherDashboard();
        setTeacherSubjectName(data.subjectName);
      } catch (error) {
        console.error("교사 과목 조회 실패", error);
      }
    };

    fetchTeacherInfo();
  }, []);

  const startEdit = (item: SubjectScore) => {
    setEditingGradeId(item.gradeId);
    setEditingScore(String(item.score));
  };

  const cancelEdit = () => {
    setEditingGradeId(null);
    setEditingScore("");
  };

  const saveEdit = async () => {
    if (editingGradeId == null) return;

    const numericScore = Number(editingScore);

    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      alert("점수는 0~100 사이의 숫자여야 합니다.");
      return;
    }

    try {
      setSaving(true);
      await updateGrade(editingGradeId, { score: numericScore });
      alert("성적이 수정되었습니다.");
      cancelEdit();
      await onRefresh();
    } catch (error) {
      console.error(error);
      alert("성적 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          과목별 점수
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          로그인한 교사는 본인 담당 과목의 성적만 수정할 수 있습니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-slate-200">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm font-semibold text-slate-500">
              <th className="whitespace-nowrap px-5 py-4">과목명</th>
              <th className="whitespace-nowrap px-5 py-4">학기</th>
              <th className="whitespace-nowrap px-5 py-4">점수</th>
              <th className="whitespace-nowrap px-5 py-4">등급</th>
              <th className="whitespace-nowrap px-5 py-4">반 평균</th>
              <th className="whitespace-nowrap px-5 py-4">전체 평균</th>
              <th className="whitespace-nowrap px-5 py-4">관리</th>
            </tr>
          </thead>

          <tbody>
            {student.subjectScores.length > 0 ? (
              student.subjectScores.map((item) => {
                const canEdit = teacherSubjectName === item.subjectName;
                const isEditing = editingGradeId === item.gradeId;

                return (
                  <tr
                    key={item.gradeId}
                    className="border-t border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {item.subjectName}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {item.semester}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={editingScore}
                          onChange={(e) => setEditingScore(e.target.value)}
                          className="w-24 rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-400"
                        />
                      ) : (
                        <span>{item.score}점</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {item.letterGrade ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      {item.classAverage ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      {item.totalAverage ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={saving}
                            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            저장
                          </button>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                          >
                            취소
                          </button>
                        </div>
                      ) : canEdit ? (
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          수정
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-sm text-slate-400"
                >
                  성적 정보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
