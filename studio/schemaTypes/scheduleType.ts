import { defineField, defineType } from "sanity";

export const scheduleType = defineType({
  name: "schedule",
  title: "Schedule Item",
  type: "document",
  fields: [
    defineField({
      name: "time",
      title: "Time Slot (e.g. 09:00 AM - 10:00 AM)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Session Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "speaker",
      title: "Speaker Name(s) (comma-separated)",
      type: "string",
    }),
    defineField({
      name: "type",
      title: "Session Type",
      type: "string",
      options: {
        list: [
          { title: "Keynote", value: "keynote" },
          { title: "Workshop", value: "workshop" },
          { title: "Break", value: "break" },
          { title: "General", value: "general" },
          { title: "Panel", value: "panel" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "day",
      title: "Day Number (1 or 2)",
      type: "number",
      options: {
        list: [1, 2],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderAsc",
      title: "Ordering Index (for sorting)",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
