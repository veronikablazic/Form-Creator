import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

type SubmissionPayload = {
  formId: string;
  answers: {
    [fieldId: string]: string;
  };
};

export async function POST(request: Request) {
  try {
    const { formId, answers } = (await request.json()) as SubmissionPayload;

    if (!formId || !answers) {
      return NextResponse.json({ message: 'Missing formId or answers' }, { status: 400 });
    }

    const newResponse = await prisma.$transaction(async (tx) => {
      const response = await tx.formResponse.create({
        data: {
          formId: formId,
        },
      });

      const answersToCreate = Object.entries(answers).map(([fieldId, value]) => ({
        value: value,
        responseId: response.id,
        fieldId: fieldId,
      }));

      await tx.fieldResponse.createMany({
        data: answersToCreate,
      });

      return response;
    });

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('Failed to submit form:', error);
    return NextResponse.json({ message: 'Error submitting form' }, { status: 500 });
  }
}