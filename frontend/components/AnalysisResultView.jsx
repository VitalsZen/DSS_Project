import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Icon } from "./Icon";
import { useApplicationContext } from "../context/ApplicationContext";

const RADAR_LABELS = {
    "Hard Skills": "Kỹ năng cứng",
    "Soft Skills": "Kỹ năng mềm",
    "Experience": "Kinh nghiệm",
    "Education": "Học vấn",
    "Domain Knowledge": "Kiến thức ngành"
};

export const AnalysisResultView = ({ customTitle, customSubtitle, data }) => {
  const { language, t } = useApplicationContext();
  const [showReasoning, setShowReasoning] = useState(false); // State bật tắt Drawer

  if (!data) return null;

  // Radar handlers
  const radarData = Object.entries(data.radar_chart).map(([subject, score]) => {
    let reasonText = "No explanation provided.";
    if (data.radar_reasoning && data.radar_reasoning[subject]) {
        const reasonObj = data.radar_reasoning[subject];
        if (typeof reasonObj === 'object') {
            reasonText = reasonObj[language] || reasonObj['en'] || "";
        } else if (typeof reasonObj === 'string') {
            reasonText = reasonObj;
        }
    }
    return {
        // Return radar attribute
        subject: language === 'vi' ? (RADAR_LABELS[subject] || subject) : subject,
        score,
        fullMark: 10,
        reason: reasonText
    };
  });

  const scoreData = [
    { name: 'Matched', value: data.matching_score.percentage, color: '#137fec' },
    { name: 'Unmatched', value: 100 - data.matching_score.percentage, color: '#f1f5f9' }
  ];

  const getScoreColor = (score) => {
      if (score >= 8) return "bg-green-100 text-green-700 border-green-200";
      if (score >= 5) return "bg-yellow-50 text-yellow-700 border-yellow-200";
      return "bg-red-50 text-red-700 border-red-200";
  };

  const comparisonTable = Array.isArray(data.bilingual_content.comparison_table) 
    ? data.bilingual_content.comparison_table 
    : (data.bilingual_content.comparison_table[language] || []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Info */}
      {(customTitle || customSubtitle) && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
                 <h2 className="text-xl font-bold text-text-light dark:text-text-dark">{customTitle}</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">{customSubtitle}</p>
             </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MATCHSCORE */}
          <div className="lg:col-span-5 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wide">{t('result.overall_score')}</h3>
                <div className="relative size-48 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={scoreData} cx="50%" cy="50%" innerRadius={70} outerRadius={85} startAngle={90} endAngle={-270} dataKey="value" stroke="none" cornerRadius={10} paddingAngle={5}>
                                {scoreData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-text-light dark:text-text-dark tracking-tighter">{data.matching_score.percentage}%</span>
                        <span className="text-sm font-medium text-slate-400">{t('result.confidence')}</span>
                    </div>
                </div>
                <div className="flex w-full gap-4">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-bold text-text-light dark:text-text-dark">{data.requirements_breakdown.must_have_ratio}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('result.must_have')}</span>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-bold text-text-light dark:text-text-dark">{data.requirements_breakdown.nice_to_have_ratio}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('result.nice_to_have')}</span>
                    </div>
                </div>
          </div>

          {/* RADAR CHART */}
          <div className="lg:col-span-7 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
              
              {/* Header */}
              <div className="p-6 pb-2 flex justify-between items-center z-10">
                  <h3 className="text-base font-bold text-text-light dark:text-text-dark">{t('result.radar_chart')}</h3>
                  
                  {/* DRAWER TOGGLE */}
                  <button 
                    onClick={() => setShowReasoning(!showReasoning)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        showReasoning 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {showReasoning ? (
                        <>{t('result.btn_close_details')} <Icon name="close" className="text-sm" /></>
                    ) : (
                        <>{t('result.btn_why_score')} <Icon name="info" className="text-sm" /></>
                    )}
                  </button>
              </div>

              {/* CHART AREA */}
              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      {/* [FIX] Luôn giữ radius 70%, không co lại */}
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 15, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="score" stroke="#137fec" strokeWidth={3} fill="#137fec" fillOpacity={0.2} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>

              {/* SLIDE-IN DRAWER */}
              <div 
                className={`absolute top-0 right-0 h-full w-[400px] bg-slate-50/95 dark:bg-slate-800/95 border-l border-border-light dark:border-border-dark transform transition-transform duration-300 ease-in-out z-20 flex flex-col backdrop-blur-sm ${
                    showReasoning ? 'translate-x-0 shadow-xl' : 'translate-x-full'
                }`}
              >
                  <div className="p-4 border-b border-border-light dark:border-border-dark font-bold text-sm text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center">
                      <span>{t('result.drawer_title')}</span>
                      <button onClick={() => setShowReasoning(false)} className="text-slate-400 hover:text-slate-600">
                          <Icon name="close" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                      {radarData.map((item, index) => (
                          <div key={index}>
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.subject}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getScoreColor(item.score)}`}>
                                      {item.score}/10
                                  </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                  {item.reason}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                  <Icon name="label" className="text-lg" /> {t('result.matched_keywords')}
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
                  <Icon name="psychology" className="text-lg" /> {t('result.ai_assessment')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {data.bilingual_content.general_assessment[language] || data.bilingual_content.general_assessment['en']}
              </p>
            </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-text-light dark:text-text-dark flex items-center gap-2">
                  <Icon name="table_chart" className="text-primary" /> {t('result.detailed_comparison')}
              </h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-card-dark border-b border-border-light dark:border-border-dark">
                      <tr>
                          <th className="px-6 py-4 font-bold w-[40%]">{t('result.table.req')}</th>
                          <th className="px-6 py-4 font-bold w-[50%]">{t('result.table.ev')}</th>
                          <th className="px-6 py-4 font-bold w-[10%] text-center">{t('result.table.status')}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {comparisonTable.map((row, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-card-light dark:bg-card-dark">
                              <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-semibold align-top leading-relaxed">{row.jd_requirement}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 align-top leading-relaxed">{row.cv_evidence}</td>
                              <td className="px-6 py-4 align-top text-center">
                                  {row.status === 'Matched' ? (
                                      <div className="size-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50"><Icon name="check" className="text-lg font-bold" /></div>
                                  ) : (
                                      <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-200 dark:border-slate-700"><Icon name="close" className="text-lg font-bold" /></div>
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
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg"><Icon name="thumb_up" className="text-xl" /></div>{t('result.strengths')}
              </h4>
              <ul className="space-y-4">
                  {(data.bilingual_content.strengths[language] || data.bilingual_content.strengths['en']).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                          <div className="mt-0.5 text-green-600 dark:text-green-400"><Icon name="check_circle" className="text-xl" fill /></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
              <h4 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-5 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Icon name="warning" className="text-xl" /></div>{t('result.weaknesses')}
              </h4>
              <ul className="space-y-4">
                  {(data.bilingual_content.weaknesses_missing_skills[language] || data.bilingual_content.weaknesses_missing_skills['en']).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg">
                          <div className="mt-0.5 text-orange-500 dark:text-orange-400"><Icon name="remove_circle" className="text-xl" fill /></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-6 flex items-center gap-2">
              <Icon name="question_answer" className="text-primary" /> {t('result.interview_questions')}
          </h3>
          <div className="grid grid-cols-1 gap-4">
              {(data.bilingual_content.interview_questions[language] || data.bilingual_content.interview_questions['en']).map((question, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark transition-colors">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold shrink-0 shadow-inner">{index + 1}</span>
                      <p className="pt-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{question}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
