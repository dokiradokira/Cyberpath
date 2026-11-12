# CyberPath Curriculum Quality Standard 1.0

> 本文件是 CyberPath 课程开发与验收的统一标准，适用于后续由 DeepSeek Harness（DSH）、Codex 或人类作者新增、改写、评审的课程、实验与测验。标准正文为英文，附录给出本项目仓库中的落地位置与验收命令。标准与产品代码冲突时，以本标准的教学目标为准，并在评审记录中说明例外。

- **Version**: 1.0
- **Status**: Normative for new and modified courses; existing stable courses are not rewritten without a meaningful reason (§10).
- **Scope**: lesson content, vocabulary integration, exercises, labs, assessments, review and release.
- **Owner**: CyberPath maintainers.

## 1. Educational Positioning

CyberPath aims to provide university-level computer science education through a progressive, beginner-friendly learning experience.

Core principles:

- University-level conceptual depth and technical accuracy.
- Zero-assumption teaching for beginners.
- Progressive knowledge construction.
- Integrated technical English learning.
- Interactive experimentation and practical application.
- Independent reasoning rather than memorization.

## 2. Content Depth

Every major concept should address, where applicable:

1. **Definition**: What is it?
2. **Motivation**: Why is it needed?
3. **Mechanism**: How does it work internally?
4. **Process**: How does it operate step by step?
5. **Application**: Where is it used in real systems?
6. **Misconceptions**: What do beginners commonly misunderstand?
7. **Connections**: How does it relate to other concepts?

Do not confuse lengthy content with deep teaching. Every explanation must contribute to understanding.

## 3. Beginner Scaffolding

- Explicitly identify prerequisite knowledge.
- Explain necessary concepts before relying on them.
- Introduce intuitive explanations before technical details.
- Use concrete examples, diagrams and step-by-step reasoning.
- Gradually introduce formulas, algorithms and abstractions.
- Clearly distinguish simplified models from real implementations.

Never assume that a beginner already understands an unexplained technical term.

## 4. Technical English Requirements

Vocabulary learning is an integral part of CyberPath.

Cover four categories:

- Technical nouns and terminology.
- Common technical verbs.
- Frequently used technical phrases.
- Domain-specific expressions.

Requirements:

- Provide accurate Chinese explanations for important terminology.
- Explain common technical verbs in their professional context.
- Explain phrases by meaning rather than literal word substitution.
- Distinguish easily confused technical terms.
- Include contextual examples.
- Integrate vocabulary with the existing shared vocabulary, collection and review systems.
- Avoid annotating ordinary English words unnecessarily.

## 5. Course Structure

Each course should define:

- Prerequisites
- Technical Learning Objectives
- English Learning Objectives
- Introduction and motivation
- Core concepts
- Step-by-step technical explanations
- Real-world examples
- Interactive experiments
- Progressive exercises
- Practical applications
- Review and knowledge checks

Course length should be determined by learning objectives, not an arbitrary word count.

Long courses should be divided into manageable sections with clear progress and estimated study time.

## 6. Interactive Labs

A high-quality lab should support:

1. **Predict**: Learners predict an outcome.
2. **Manipulate**: Learners modify inputs or parameters.
3. **Observe**: Learners inspect system state changes.
4. **Explain**: Learners explain why the result occurred.
5. **Apply**: Learners solve a new scenario.

Labs must accurately represent the underlying technical principles and document simulation limitations.

The same experiment should be accessible through both the lesson and the central Interactive Lab area, using the shared implementation.

## 7. Assessment

Assess at least three levels:

- Fundamental understanding.
- Practical application.
- Integrated reasoning.

Feedback must explain incorrect answers and identify the underlying misconception.

Assessments should test what the course actually taught.

Include practical tasks and cumulative exercises where appropriate.

## 8. Quality Review Rubric

Total: 100 points.

| Dimension | Points |
| --- | ---: |
| Knowledge depth and technical accuracy | 25 |
| Beginner accessibility | 20 |
| Technical English | 15 |
| Curriculum structure and prerequisites | 10 |
| Interactive lab quality | 15 |
| Assessment and learning outcomes | 10 |
| Real-world engineering application | 5 |

Recommended passing score: **85/100**.

Critical technical errors, broken prerequisite chains, materially misleading experiments and serious instructional gaps are mandatory blockers regardless of the numerical score.

## 9. Review and Release Gates

Separate technical quality from educational quality.

**Technical gate:**

- TypeScript, lint and production build.
- Unit and browser regression.
- Storage and backward compatibility.
- Mobile usability.
- CI verification.

**Educational gate:**

- Conceptual accuracy.
- Sufficient explanatory depth.
- Beginner comprehension.
- English annotation coverage.
- Logical progression.
- Meaningful experiments.
- Effective assessment.

A course is eligible for release only after both gates pass.

## 10. Continuous Improvement

Use actual learner feedback to identify confusing explanations, missing prerequisites and insufficient examples.

Do not rewrite stable courses without a meaningful reason.

Prioritize targeted improvements over unnecessary expansion.

CyberPath measures success by what learners can understand, explain, operate and independently apply — not by the number of lessons published.

---

## Appendix A. Repository Mapping

This appendix is CyberPath-specific guidance for applying the standard; it does not change the standard above.

### A.1 Where content lives

| Concern | Location | Notes |
| --- | --- | --- |
| Lesson content | `src/content/lessons/*.ts` | One module per course group; register in `src/content/lessons/index.ts` |
| Lesson types | `src/types/index.ts` | `Lesson`, `LessonBrief`, `Exercise`, `Vocabulary` |
| Shared vocabulary | `src/content/vocabulary.ts` | Single dictionary; lessons contribute `vocabulary` entries |
| Course summaries | `src/content/course-summaries.ts` | Positional by lesson number; update when numbering changes |
| Lab registry | `src/lib/labs.ts` | `labInfo` metadata and IDs |
| Lab components | `src/components/labs/` | One component per lab, shared by lesson and `/labs` |
| Lab center page | `src/app/labs/page.tsx` | Renders every registry entry automatically |
| Reading annotations | `src/components/lessons/annotated-text.tsx`, `src/lib/terms.ts` | Highlights shared vocabulary in prose |
| Exercises | `lesson.exercises` | Understand / Apply / Reason with per-option feedback |
| Quiz | `lesson.quiz` | Five questions, four options, explanation per question |

### A.2 Lesson contract

- Keep stable IDs. Never rename published lesson, section, quiz or lab IDs; never change `introducedIn` downward.
- Provide `brief` with `prerequisites`, `technicalGoals`, `englishGoals` and `completion` for every new lesson.
- Sections must be ordered as a teaching sequence: motivation → mechanism → process → application → misconceptions → connections → summary.
- Render prose through `AnnotatedText`; do not hand-roll term highlighting.
- Exercises must include one each of `Understand`, `Apply`, `Reason`; every option needs its own explanatory feedback, not only the correct one.
- Quiz questions must map to a real section through `topicSections` in `src/lib/study.ts`.

### A.3 Vocabulary contract

- Add terms to the lesson's `vocabulary`; they flow into the shared `wordEntries`.
- Provide `word`, `zh`, `definition` and an English `example` that uses the term naturally.
- Use `aliases` for plural or surface forms that the highlighter should match.
- Do not create a second dictionary or duplicate an existing `zh`.
- Keep annotations meaningful: technical nouns/verbs/phrases, not ordinary words.

### A.4 Lab contract

- Register every lab in `labInfo`; the lab center and lesson entry must render the same component.
- Implement Predict → Manipulate → Observe → Explain → Apply. Prediction must be checked against observed results.
- State the simplified model and its limitations in the lab UI (`caption`).
- Never execute real network, shell or filesystem operations from the browser.
- No horizontal overflow at 390 px; controls must remain touch-sized and keyboard reachable.
- Controls stay disabled until hydration and profile restore complete, so early taps cannot be lost.

### A.5 Storage and compatibility

- New lessons use a `contentVersion` (`introducedIn`) that never decreases.
- Older profiles must gain empty records for new lessons without losing marks, notes or mistakes.
- Do not change IndexedDB schema, backup format or stable keys for curriculum additions.
- Do not weaken F01/F02/F03 protections.

## Appendix B. Review Checklist

Use both gates; record evidence rather than opinions.

### B.1 Technical gate

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm test`
- [ ] `npm run test:e2e` (Chromium + WebKit iPhone)
- [ ] `npm run test:lan`
- [ ] Lesson opens from `/courses`; lab opens from both lesson and `/labs`
- [ ] 390 px viewport has no document overflow
- [ ] Old profile upgrade verified; no record loss
- [ ] CI green for the exact commit SHA

### B.2 Educational gate

- [ ] Every major concept covers definition, motivation, mechanism, process, application, misconceptions and connections where applicable
- [ ] Prerequisites are explicit and satisfied by earlier lessons
- [ ] Intuitive explanation precedes formal detail
- [ ] Simplified models are labelled as such
- [ ] Key terms have accurate Chinese glosses and contextual English examples
- [ ] Confusable terms are distinguished
- [ ] Exercises assess understanding, application and reasoning
- [ ] Wrong answers receive targeted feedback that names the misconception
- [ ] Labs require prediction before observation and explain the result
- [ ] Course length follows objectives, with sections and time estimates
- [ ] No critical technical error, broken prerequisite chain or misleading experiment

### B.3 Scoring record

| Dimension | Max | Score | Evidence |
| --- | ---: | ---: | --- |
| Knowledge depth and technical accuracy | 25 | | |
| Beginner accessibility | 20 | | |
| Technical English | 15 | | |
| Curriculum structure and prerequisites | 10 | | |
| Interactive lab quality | 15 | | |
| Assessment and learning outcomes | 10 | | |
| Real-world engineering application | 5 | | |
| **Total** | **100** | | Pass ≥ 85 and no blocker |

Reviewer and date: ____________________

## Appendix C. Relationship to Existing Documents

- `docs/PROJECT_STATUS.md`: current stage, tested revision and CI state.
- `docs/AGENT_HANDOFF.md`: per-agent handoff records and constraints.
- `docs/SECURE_DEVELOPMENT_WORKFLOW.md`: data protection, testing and Git safety.
- `docs/CURRICULUM_3_DNS_SAMPLE.md` and `docs/DNS_SAMPLE_READING_POLISH.md`: worked examples of the reading/vocabulary/lab pattern.
- `MOTION_INTERACTION_UPGRADE.md` and `MOTION_REFINEMENT.md`: interaction and accessibility expectations that labs must respect.

When this standard and a stage report disagree, this standard governs new work; the stage report remains the evidence for its own revision.
