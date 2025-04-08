"use client"
import  Link from "next/link";

export default function Home() {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Expense Tracker</h1>
        <p className="text-lg text-gray-400 max-w-md mb-6">
          Take control of your finances with our simple and intuitive expense tracking tool. Manage your income and expenses effortlessly.
        </p>
        <div className="flex gap-4">
        <Link href="/dashboard">
          <button className="bg-white text-black px-6 py-3 font-semibold rounded-lg">
            Get Started
          </button>
          </Link>
          <button className="bg-gray-800 text-white px-6 py-3 font-semibold rounded-lg">
            Learn More
          </button>
        </div>
      </div>
    );
  }