
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Icon } from "./Icon";
import { useApplicationContext } from "../context/ApplicationContext";

const DEFAULT_MOCK_DATA = {
  personal_info: {
    name: "Le Hoang Dang",
    position: "Java Developer",
    experience: "0.3 years (Internship)"
  },
  matching_score: {
    percentage: 86,
    explanation: "Matched 6/7 requirements"
  },
  requirements_breakdown: {
    must_have_ratio: "6/7",
    nice_to_have_ratio: "0/0"
  },
  matched_keywords: [
    "JavaScript", "ReactJS", "HTML", "CSS", "API", "RESTful APIs (Implied)"
  ],
  radar_chart: {
    "Hard Skills": 9,
    "Soft Skills": 8,
    "Experience": 6,
    "Education": 9,
    "Domain Knowledge": 8
  },
  bilingual_content: {
    general_assessment: {
      en: "The candidate is a strong recent graduate with a solid foundation in both backend (Java/Spring Boot) and frontend (ReactJS). They meet the experience range (0-2 years) and possess most of the required technical skills for a Junior Frontend role.",
      vi: "Ứng viên là một sinh viên mới tốt nghiệp xuất sắc với nền tảng vững chắc cả về backend (Java/Spring Boot) và frontend (ReactJS). Ứng viên đáp ứng phạm vi kinh nghiệm (0-2 năm)."
    },
    comparison_table: {
      en: [
        { jd_requirement: "0-2 years experience with JavaScript and ReactJS.", cv_evidence: "4 months internship using ReactJS.", status: "Matched" },
        { jd_requirement: "Solid knowledge of HTML5, CSS3.", cv_evidence: "Listed HTML, CSS in Skills.", status: "Matched" },
        { jd_requirement: "Proficient in Git.", cv_evidence: "Not found.", status: "Not Matched" }
      ],
      vi: [
        { jd_requirement: "0-2 năm kinh nghiệm với JavaScript.", cv_evidence: "4 tháng thực tập.", status: "Matched" },
        { jd_requirement: "Kiến thức về HTML5, CSS3.", cv_evidence: "Đã liệt kê.", status: "Matched" },
        { jd_requirement: "Thành thạo Git.", cv_evidence: "Không tìm thấy.", status: "Not Matched" }
      ]
    },
    strengths: {
      en: ["Strong academic background.", "Practical experience with ReactJS."],
      vi: ["Nền tảng học vấn vững chắc.", "Kinh nghiệm thực tế với ReactJS."]
    },
    weaknesses_missing_skills: {
      en: ["Lack of explicit Git experience.", "Focus heavily on Backend."],
      vi: ["Thiếu kinh nghiệm Git rõ ràng.", "Tập trung nhiều vào Backend."]
    },
    interview_questions: {
      en: ["Describe your Git workflow?", "How do you manage state in React?"],
      vi: ["Mô tả quy trình Git của bạn?", "Bạn quản lý state trong React thế nào?"]
    }
  }
};

export const AnalysisResultView = ({ 
  customTitle, 
  customSubtitle, 
  data = DEFAULT_MOCK_DATA 
}) => {
  const { language } = useApplicationContext();

  const radarData = Object.entries(data.radar_chart).map(([subject, score]) => ({
    subject,
    score,
    fullMark: 10,
  }));

  const scoreData = [
    { name: 'Matched', value: data.matching_score.percentage, color: '#137fec' },
    { name: 'Unmatched', value: 100 - data.matching_score.percentage, color: '#f1f5f9' }
  ];

  const getComparisonTable = () => {
    const table = data.bilingual_content.comparison_table;
    if (Array.isArray(table)) {
      return table;
    }
    return table[language] || table['en'] || [];
  };

  const comparisonTable = getComparisonTable();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {(customTitle || customSubtitle) && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
                 <h2 className="text-xl font-bold text-text-light dark:text-text-dark">{customTitle}</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">{customSubtitle}</p>
             </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wide">Overall  Match  Score</h3>
                
                <div className="relative size-48 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={scoreData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={85}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={10}
                            paddingAngle={5}
                        >
                            {scoreData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-text-light dark:text-text-dark tracking-tighter">{data.matching_score.percentage}%</span>
                    <span className="text-sm font-medium text-slate-400">Confidence</span>
                </div>
                </div>

                <div className="flex w-full gap-4">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-bold text-text-light dark:text-text-dark">{data.requirements_breakdown.must_have_ratio}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Must Have</span>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-bold text-text-light dark:text-text-dark">{data.requirements_breakdown.nice_to_have_ratio}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nice to Have</span>
                    </div>
                </div>
          </div>

          <div className="lg:col-span-7 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-text-light dark:text-text-dark mb-4">Competency Radar</h3>
              <div className="h-[300px] w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar
                              name="Score"
                              dataKey="score"
                              stroke="#137fec"
                              strokeWidth={3}
                              fill="#137fec"
                              fillOpacity={0.2}
                          />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
      
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                  <Icon name="label" className="text-lg" /> Matched Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                  {data.matched_keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-100 dark:border-blue-800/30">
                          {keyword}
                      </span>
                  ))}
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

            <div className="p-6 pt-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-3">
                  <Icon name="psychology" className="text-lg" /> AI Assessment
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {data.bilingual_content.general_assessment[language] || data.bilingual_content.general_assessment['en']}
              </p>
            </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-text-light dark:text-text-dark flex items-center gap-2">
                  <Icon name="table_chart" className="text-primary" /> Detailed Comparison
              </h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-card-dark border-b border-border-light dark:border-border-dark">
                      <tr>
                          <th className="px-6 py-4 font-bold w-[40%]">Job Requirement</th>
                          <th className="px-6 py-4 font-bold w-[50%]">CV Evidence</th>
                          <th className="px-6 py-4 font-bold w-[10%] text-center">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {comparisonTable.map((row, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-card-light dark:bg-card-dark">
                              <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-semibold align-top leading-relaxed">{row.jd_requirement}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 align-top leading-relaxed">{row.cv_evidence}</td>
                              <td className="px-6 py-4 align-top text-center">
                                  {row.status === 'Matched' ? (
                                      <div className="size-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50">
                                            <Icon name="check" className="text-lg font-bold" />
                                      </div>
                                  ) : (
                                      <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-200 dark:border-slate-700">
                                            <Icon name="close" className="text-lg font-bold" />
                                      </div>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
              <h4 className="text-lg font-bold text-green-700 dark:text-green-400 mb-5 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Icon name="thumb_up" className="text-xl" />
                  </div>
                  Strengths
              </h4>
              <ul className="space-y-4">
                  {(data.bilingual_content.strengths[language] || data.bilingual_content.strengths['en']).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                          <div className="mt-0.5 text-green-600 dark:text-green-400">
                              <Icon name="check_circle" className="text-xl" fill />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
              <h4 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-5 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Icon name="warning" className="text-xl" />
                  </div>
                  Weaknesses & Gaps
              </h4>
              <ul className="space-y-4">
                  {(data.bilingual_content.weaknesses_missing_skills[language] || data.bilingual_content.weaknesses_missing_skills['en']).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg">
                          <div className="mt-0.5 text-orange-500 dark:text-orange-400">
                              <Icon name="remove_circle" className="text-xl" fill />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-6 flex items-center gap-2">
              <Icon name="question_answer" className="text-primary" /> Suggested Interview Questions
          </h3>
          <div className="grid grid-cols-1 gap-4">
              {(data.bilingual_content.interview_questions[language] || data.bilingual_content.interview_questions['en']).map((question, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark transition-colors">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold shrink-0 shadow-inner">
                          {index + 1}
                      </span>
                      <p className="pt-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {question}
                      </p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
