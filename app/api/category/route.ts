import { NextRequest, NextResponse } from 'next/server';
import {Category} from '@/model/Category';
import dbConnect from '@/lib/db';

// Connect to the database
dbConnect();


export async function GET() {
    try {
        const categories = await Category.find()
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

//month: "2025-02" monthlyLimit: "500" name: "hello" sample of post data
export async function POST(req: NextRequest) {
    try {
        const { name, monthlyLimit, month } = await req.json();
        const categoryName = name.trim();
        const monthlyLimitValue = parseFloat(monthlyLimit);
        if (isNaN(monthlyLimitValue)) {
            return NextResponse.json(
                { message: 'Invalid monthly limit' },
                { status: 400 }
            );
        }
        const monthValue = month.trim();
        const ifCategoryExist = await Category.findOne({ name: categoryName, month: monthValue });
        if (ifCategoryExist) {
            return NextResponse.json(
                { message: 'Category already exists' },
                { status: 400 }
            );
        }
        const newCategory = await Category.create({
            name: categoryName,
            monthlyLimit: monthlyLimitValue,
            month: monthValue
        })
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const {monthlyLimit } = await req.json();
        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }
        const monthlyLimitValue = parseFloat(monthlyLimit);
        if (isNaN(monthlyLimitValue)) {
            return NextResponse.json(
                { message: 'Invalid monthly limit' },
                { status: 400 }
            );
        }
        category.monthlyLimit = monthlyLimitValue;
        await category.save();
        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
