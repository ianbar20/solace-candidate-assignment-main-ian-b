import { NextResponse } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { InferSelectModel } from "drizzle-orm";

export interface Advocate {
  id: number | string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string | number;
}

export async function GET(): Promise<Response> {
  try {
    const useMock = process.env.USE_MOCK_DATA === "true";

    const data = useMock
      ? advocateData
      : await db!.select().from(advocates);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in GET /advocates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}