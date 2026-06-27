import { Client } from "@notionhq/client";

export async function archiveToNotion(
  notionApiKey: string,
  databaseId: string,
  data: {
    keyword: string;
    linkedinPost: string;
    infographicUrl: string | null;
  }
): Promise<void> {
  const notion = new Client({ auth: notionApiKey });

  const properties: Record<string, any> = {
    // Page Title (using keyword)
    Title: {
      title: [
        {
          text: {
            content: data.keyword,
          },
        },
      ],
    },
    // Status column
    Status: {
      select: {
        name: "Generated",
      },
    },
    // Date of run
    "Created At": {
      date: {
        start: new Date().toISOString(),
      },
    },
  };

  // LinkedIn Post rich text (up to Notion limits)
  properties["LinkedIn Post"] = {
    rich_text: [
      {
        text: {
          content: data.linkedinPost.substring(0, 2000), // Safety check
        },
      },
    ],
  };

  // Infographic URL if generated
  if (data.infographicUrl) {
    properties["Infographic URL"] = {
      url: data.infographicUrl,
    };
  }

  await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties,
  });
}
