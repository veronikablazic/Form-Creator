import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

type FieldPayload = {
  title: string;
  type: string;
};

type SectionPayload = {
  title: string;
  sortIndex: number;
  fields: FieldPayload[];
};

type RequestBody = {
  formTitle: string;
  sections: SectionPayload[];
};

export async function POST(
  req: Request
) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` });
  }

  const body = await req.json();
  const { formTitle, sections } = body as RequestBody;

  if (!formTitle || !sections) {
    return NextResponse.json({ message: 'Missing form title or sections' });
  }

  try {
    const newForm = await prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          title: formTitle,
        },
      });

      for (const sectionData of sections) {
        const section = await tx.section.create({
          data: {
            title: sectionData.title,
            sortIndex: sectionData.sortIndex,
            formId: form.id,
          },
        });

        if (sectionData.fields && sectionData.fields.length > 0) {
          const fieldsToCreate = sectionData.fields.map((field) => ({
            ...field,
            sectionId: section.id,
          }));

          await tx.field.createMany({
            data: fieldsToCreate,
          });
        }
      }

      return form;
    });

    return NextResponse.json(newForm);
  } catch (error) {
    console.error('Request error', error);
    NextResponse.json({ error: 'Error creating form', details: error });
  }
}

export async function GET(
  req: Request
) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` });
  }
  
  try {
    const forms = await prisma.form.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Request error', error);
    NextResponse.json({ error: 'Error getting forms', details: error });
  }
}

export async function DELETE(
  req: Request
) {
  if (req.method !== 'DELETE') {
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` });
  }

  const body = await req.json();
  const { formId } = body;
  
  try {
    await prisma.form.delete({
      where: { id: formId },
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('Request error', error);
    NextResponse.json({ error: 'Error deleting a form', details: error });
  }
}