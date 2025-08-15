import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { formId: string } }
) {
    const { formId } = await params;

    try {
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                sections: {
                orderBy: { sortIndex: 'asc' },
                include: {
                    fields: true,
                },
                },
            },
        });

        if (!form) {
            return NextResponse.json({ message: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json(form);
    } catch (error) {
        console.error('Failed to fetch form:', error);
        return NextResponse.json({ message: 'Error fetching form' }, { status: 500 });
    }
}

export async function DELETE(
  request: Request,
  { params }: { params: { formId: string } }
) {
  const { formId } = params;

  try {
    await prisma.form.delete({
      where: { id: formId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete form:', error);
    return NextResponse.json({ message: 'Error deleting form' }, { status: 500 });
  }
}