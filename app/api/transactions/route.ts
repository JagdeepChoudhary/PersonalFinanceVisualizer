import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/model/Transaction';
import dbConnect from '@/lib/db';
import { Category } from '@/model/Category';

dbConnect();

export async function GET() {
  try {

    const transactions = await Transaction.find().populate('category').sort({ date: -1 });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: message === 'Not authenticated' ? 401 : 500 });
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const { amount, date, description, category = "Uncategorized" } = await req.json();
//     const month = date.substring(0, 7); 
   
//     if (!amount || !date || !description||!category ) {
//       return NextResponse.json(
//         { message: 'All fields are required' },
//         { status: 400 }
//       );
//     }
//     const categoryName = category.trim();
//     const amountValue = parseFloat(amount);
//     if (isNaN(amountValue)) {
//       return NextResponse.json(
//         { message: 'Invalid amount' },
//         { status: 400 }
//       );
//     } else if (amountValue <= 0) {
//       return NextResponse.json(
//         { message: 'Amount must be greater than 0' },
//         { status: 400 }
//       );
//     }
//     const descriptionValue = description.trim();
//     let categoryValue = await Category.findOne({ name: category });
//     if (!categoryValue) {
//       const newCategory = await Category.create({
//         name: categoryName,
//         month,
//       });
//       categoryValue = newCategory;
//     }else{
//       categoryValue.monthlySpend += amountValue;
//       await categoryValue.save();
//     }

//     const transaction = await Transaction.create({
//       amount,
//       date,
//       description: descriptionValue,
//       category: categoryValue._id,
//     });

//     return NextResponse.json(transaction, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: 'Server error' }, { status: 500 });
//   }
// }

// PUT Request: Update a transaction
export async function POST(req: NextRequest) {
  try {
    const { amount, date, description, category = "Uncategorized" } = await req.json();
    const month = date.substring(0, 7);

    // Correct validation
    if (!amount || !date || !description) {
      return NextResponse.json(
        { message: 'Amount, date, and description are required' },
        { status: 400 }
      );
    }

    const categoryName = category.trim();
    const amountValue = parseFloat(amount);

    if (isNaN(amountValue)) {
      return NextResponse.json(
        { message: 'Invalid amount' },
        { status: 400 }
      );
    } else if (amountValue <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const descriptionValue = description.trim();

    let categoryValue = await Category.findOne({ name: categoryName, month });

    if (!categoryValue) {
      categoryValue = await Category.create({
        name: categoryName,
        month,
        monthlySpend: amountValue
      });
    } else {
      categoryValue.monthlySpend += amountValue;
      await categoryValue.save();
    }

    const transaction = await Transaction.create({
      amount: amountValue,
      date,
      description: descriptionValue,
      category: categoryValue._id,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('id');

    // Validate transaction ID
    if (!transactionId) {
      return NextResponse.json(
        { message: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const { amount, date, description, category = "Uncategorized" } = await req.json();
    const month = date?.substring(0, 7);

    // Validate required fields
    if (!amount || !date || !description) {
      return NextResponse.json(
        { message: 'Amount, date, and description are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      return NextResponse.json(
        { message: 'Invalid amount' },
        { status: 400 }
      );
    } else if (amountValue <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const descriptionValue = description.trim();
    const categoryName = category.name.trim();

    // Find or create category
    let categoryValue = await Category.findOne({ name: categoryName, month });
    if (!categoryValue) {
      categoryValue = await Category.create({
        name: categoryName,
        month,
      });
    } else {
      categoryValue.monthlySpend += amountValue;
      await categoryValue.save();
    }

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId },
      {
        amount: amountValue,
        date,
        description: descriptionValue,
        category: categoryValue._id,
      },
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}


// DELETE Request: Delete a transaction
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('id');

    // Validate transaction ID
    if (!transactionId) {
      return NextResponse.json(
        { message: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Find the transaction to delete
    const transaction = await Transaction.findById(transactionId).populate('category');

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Adjust the category's monthly spend if category exists
    const { category, amount } = transaction;
    if (category) {
      const categoryValue = await Category.findById(category._id);
      if (categoryValue) {
        categoryValue.monthlySpend -= parseFloat(amount);
        if (categoryValue.monthlySpend < 0) {
          categoryValue.monthlySpend = 0;
        }
        await categoryValue.save();
      }
    }

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId);

    return NextResponse.json(
      { message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

