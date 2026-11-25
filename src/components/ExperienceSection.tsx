/**
 * Home-page Experience Section: Work & Open Source timelines.
 */
import { useEffect, useState } from "react";
import { OpenSourceExperienceItem, WorkExperienceItem } from "./ExperienceItem";
import { openSourceExperience, workExperience } from "../data/experience";
import { ExperienceTimeline } from "./ExperienceTimeline";

/**
 * Home Experience section with Work and Open Source timelines.
 * Highlights the row nearest the viewport midpoint (`work-${i}` /
 * `oss-${i}` ids); initial active id is `work-0`.
 *
 * @returns Experience section with Work and Open Source timelines.
 */
export function ExperienceSection() {
  const [activeId, setActiveId] = useState("work-0");

  useEffect(() => {
    /**
     * Sets `activeId` to the experience row whose vertical center is closest
     * to the viewport midpoint.
     *
     * @returns Nothing.
     */
    const updateActive = () => {
      const items = document.querySelectorAll<HTMLElement>(
        ".experience [data-experience-id]",
      );
      if (items.length === 0) return;

      const mid = window.innerHeight / 2;
      let closestId = items[0].dataset.experienceId ?? "work-0";
      let closestDistance = Infinity;

      for (const el of items) {
        const id = el.dataset.experienceId;
        if (!id) continue;

        const rect = el.getBoundingClientRect();
        const center = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(center - mid);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      }

      setActiveId((prev) => (prev === closestId ? prev : closestId));
    };

    const frame = requestAnimationFrame(updateActive);
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  return (
    <div className="experience__content">
      <h3 className="experience__subtitle">Work</h3>
      <ExperienceTimeline>
        {workExperience.map((job, i) => {
          const id = `work-${i}`;
          return (
            <WorkExperienceItem
              key={id}
              id={id}
              experience={job}
              isActive={activeId === id}
            />
          );
        })}
      </ExperienceTimeline>
      <h3 className="experience__subtitle">Open Source</h3>
      <ExperienceTimeline>
        {openSourceExperience.map((entry, i) => {
          const id = `oss-${i}`;
          return (
            <OpenSourceExperienceItem
              key={id}
              id={id}
              experience={entry}
              isActive={activeId === id}
            />
          );
        })}
      </ExperienceTimeline>
    </div>
  );
}
