import { skillsByCode } from '../../curriculum/catalog';
import type { Chapter, ChapterItem } from '../learner-chapters';
import { describeTopicStatus } from '../learner-chapters';

type Relation = { relationship: 'Builds on' | 'Leads to'; item: ChapterItem };

function statusWord(item: ChapterItem): string {
  return item.status === 'INDEPENDENTLY_CONFIRMED'
    ? 'Independently confirmed'
    : item.status === 'PRACTICING'
      ? 'Practicing, not yet confirmed'
      : 'Not started';
}

// Related skills come from the reviewed skill graph (prerequisiteSkillCodes),
// restricted to skills the server returned for this program. Each related
// skill's status is its recorded progress status; the table does not claim why
// anything is or is not offered.
function relatedSkills(item: ChapterItem, chapters: Chapter[]): Relation[] {
  const all = chapters.flatMap((chapter) => chapter.items);
  const byCode = new Map(all.map((candidate) => [candidate.skillCode, candidate]));
  const relations: Relation[] = [];
  for (const code of skillsByCode.get(item.skillCode)?.prerequisiteSkillCodes ?? []) {
    const related = byCode.get(code);
    if (related) relations.push({ relationship: 'Builds on', item: related });
  }
  for (const candidate of all) {
    if (skillsByCode.get(candidate.skillCode)?.prerequisiteSkillCodes.includes(item.skillCode)) {
      relations.push({ relationship: 'Leads to', item: candidate });
    }
  }
  return relations;
}

export function TopicDetail({ item, chapters }: { item: ChapterItem; chapters: Chapter[] }) {
  const status = describeTopicStatus(item);
  const relations = relatedSkills(item, chapters);
  return (
    <section aria-labelledby="topic-heading" className="topic-detail">
      <h3 id="topic-heading" tabIndex={-1}>
        Topic: {item.title}
      </h3>
      <dl className="topic-detail-status">
        <div>
          <dt>Practice</dt>
          <dd>{status.practice}</dd>
        </div>
        <div>
          <dt>Mastery</dt>
          <dd>{status.mastery}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{status.attempts}</dd>
        </div>
      </dl>
      {status.availability && <p role="status">{status.availability}</p>}
      {relations.length > 0 && (
        <table className="topic-relations">
          <caption>Related skills in this course (from the curriculum skill map)</caption>
          <thead>
            <tr>
              <th scope="col">Relationship</th>
              <th scope="col">Skill</th>
              <th scope="col">Recorded status</th>
            </tr>
          </thead>
          <tbody>
            {relations.map(({ relationship, item: related }) => (
              <tr key={`${relationship}-${related.skillCode}`}>
                <td>{relationship}</td>
                <th scope="row">{related.title}</th>
                <td>{statusWord(related)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
