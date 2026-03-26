"use server"

import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
  const name = formData.get("name")?.toString() || ""
  const tagsStr = formData.get("tags")?.toString() || ""
  const description = formData.get("description")?.toString() || ""
  const ingredients = formData.get("ingredients")?.toString() || ""
  const coreSellingPoints = formData.get("coreSellingPoints")?.toString() || ""
  const problemsSolved = formData.get("problemsSolved")?.toString() || ""
  const targetAudience = formData.get("targetAudience")?.toString() || ""
  const salesTips = formData.get("salesTips")?.toString() || ""
  const bossNotes = formData.get("bossNotes")?.toString() || ""
  const pitch = formData.get("pitch")?.toString() || ""

  // Convert comma separated string to JSON array
  const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean)

  await prisma.product.create({
    data: {
      name,
      description,
      ingredients,
      tags: tags,
      pitch,
      coreSellingPoints,
      problemsSolved,
      targetAudience,
      salesTips,
      bossNotes
    }
  })

  redirect("/")
}

export async function analyzeText(text: string) {
  // For now, returning the most recently updated product as a mock "AI match" result
  const product = await prisma.product.findFirst({
    include: {
      assets: true,
      replies: true
    },
    orderBy: { updatedAt: 'desc' }
  });
  return product;
}

export async function saveInquiryCase(data: { queryContent: string, suggestedProductId?: string, finalReply: string }) {
  await prisma.inquiryCase.create({
    data: {
      queryContent: data.queryContent,
      suggestedProductId: data.suggestedProductId,
      finalReply: data.finalReply
    }
  });
}
