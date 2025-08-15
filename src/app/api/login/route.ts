import { PrismaClient } from '../../../generated/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(
  req: Request
) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' });
  }

  const body = await req.json();
  const { username, password } = body;
  console.log(username, password);

  if (!username || !password) {
    return NextResponse.json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}