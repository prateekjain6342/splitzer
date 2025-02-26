"use client"

import React, { useState } from 'react'
import { BorderBeam } from "@/components/ui/border-beam";
import PulsatingButton from '@/components/ui/pulsating-button';
import { fireApiAction } from '@/config/api';
import { RainbowButton } from '@/components/ui/rainbow-button';
import Head from 'next/head';
import wallet from '@/public/wallet.png'
import paidByImage from '@/public/paid_by.png'
import Image from 'next/image'
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdDelete, MdDriveFileRenameOutline } from "react-icons/md"
import { VscLoading } from "react-icons/vsc";
import { FaArrowRightLong } from "react-icons/fa6";

const BillPage = ({ params }) => {
 
    const scroll2El = elID => {
        window.scrollTo({
            top: document.getElementById(elID).offsetTop - 60,
            behavior: 'smooth',
        });
    };

    const scrollToId = (e) => {
        e.preventDefault();
        const goto = e.target.getAttribute('goto');
        setTimeout(() => {
            scroll2El(goto)
        }, 100)
    }

    async function addName(name) {
        const result = await fireApiAction("api/post", "POST", {"action": "add_people", "uuid": slug, "name": name})
        return result;
    }

    async function getNames() {
        const result = await fireApiAction("api/create?action=get_people", "GET", {"uuid": slug})
        console.log(result)
        let new_people_list = []
        result.map((person) => {
            new_people_list.push(person)
        }, [])
        setPeople(new_people_list);
        return result;
    }

    async function getExpenses() {
        const result = await fireApiAction("api/create?action=get_expenses", "GET", {"uuid": slug})
        console.log(result)
        let new_expense_list = []
        result.map((expense) => {
            new_expense_list.push(expense)
        }, [])
        console.log(new_expense_list)
        setExpenses(new_expense_list);
        return result.data;
    }

    const { slug } = React.use(params);
    const [people, setPeople] = React.useState([]);
    const [name, setName] = React.useState("");
    const [expenseName, setExpenseName] = React.useState("");
    const [paidBy, setPaidBy] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [shares, setShares] = React.useState(() => {
        const initialShares = {};
        people?.forEach(person => {
            initialShares[person.id] = 1;
        })
        return initialShares;
    });



    const [expenses, setExpenses] = React.useState([]);
    const [splits, setSplits] = React.useState([]);
    const [collapseAcc, setCollapseAcc] = React.useState({});
    const [expenseBox, setExpenseBox] = React.useState({});
    const [addExpenseCtaText, setAddExpenseCtaText] = React.useState("Add Expense");
    const [addExpenseSpinner, setAddExpenseSpinner] = React.useState(true);
    const [deleteExpenseSpinner, setDeleteExpenseSpinner] = React.useState({});
    const [calculateSpinner, setCalculateSpinner] = React.useState(true);
    const [calculateCTA, setCalculateCTA] = React.useState("Next: Calculate Split");


    const handleAddName = async () => {
        if (name.trim() !== "") {
            const res = await addName(name);
            await getNames()
            setName("");
        }
    };

    async function handleAddExpense () {
        setAddExpenseCtaText("Adding...")
        setAddExpenseSpinner(false)

        const divisions = {};
        people?.forEach(person => {
            shares[person.id] ? divisions[person.id] = shares[person.id] : divisions[person.id] = 1
        })

        const result = await fireApiAction("api/post", "POST", {"action": "add_expense", "uuid": slug,
            "expense_name": expenseName,
            "expense_amount": amount,
            "paid_by": paidBy,
            "expense_division": divisions
        })

        await getExpenses();

        setAddExpenseCtaText("Add Expense")
        setAddExpenseSpinner(true)

        setExpenseName("");
        setAmount("");
        setPaidBy("");

        return result;
    };

    const handleShareChange = (person, value) => {
        
        setShares(prevShares => ({
            ...prevShares,
            [person]: value ? parseInt(value) : 1
        }));
        
    };

    const getPersonNameById = (id) => {
        const person = people.find(p => p.id === id);
        return person ? person.name : 'Unknown';
    };

    const handleDeleteExpense = async (expenseId) => {
        setDeleteExpenseSpinner({
            ...deleteExpenseSpinner,
            [expenseId]: deleteExpenseSpinner[expenseId] ? !deleteExpenseSpinner[expenseId] : true
        })
        await fireApiAction("api/post", "POST", {"action": "delete_expense", "uuid": slug, "old_expense_id": expenseId});
        await getExpenses();
    };

    const handleCalculateExpenses = async (e) => {
        setCalculateCTA("Calculating...")
        setCalculateSpinner(false)
        let res = await fireApiAction("api/post", "POST", {"action": "calculate_split", "uuid": slug});
        setCalculateCTA("Next: Calculate Split")
        setCalculateSpinner(true)
        setSplits(res.data)
        scrollToId(e)
        
    };

    const handleCopyURL = () => {
        navigator.clipboard.writeText(window.location.href)
        .then(() => {
            alert('URL copied to clipboard');
        }).catch((error) => {
            alert('Failed to copy URL');
        });
    } 

    const handleExpenseCollapse = (expense) => {
        setCollapseAcc({
            ...collapseAcc,
            [expense.id]: collapseAcc[expense.id] ? !collapseAcc[expense.id] : true,
        })

        setExpenseBox({
            ...expenseBox,
            [expense.id]: expenseBox[expense.id] ? !expenseBox[expense.id] : true
        })

    }



    React.useEffect(() => {
        getNames()
        getExpenses()
    }, [])
    

  return (
    <>
    <section 
        id="add_people"
        className='font-plusjakarta h-[calc(100dvh-64px)] lg:h-[calc(100dvh-80px)] bg-primaryDarkBlue flex flex-col justify-center items-center gap-12 text-[#D6DDE6] p-6 md:p-0'
    >
        <div className='flex-0 text-3xl lg:text-4xl xl:text-6xl text-center'>
            Who all are <span className="underline decoration-secondaryGreen">included</span> in the bill?
        </div>

        <div className='flex flex-row gap-4'>
            <input 
                className='rounded-lg p-2 pl-4 bg-primaryDarkBlue border-2 border-[#D6DDE6]/20 focus:border-secondaryGreen/50 focus:outline-none focus:ring-0 flex-0'
                placeholder='Enter name'
                value={name}
                type='text'
                onChange={(e) => setName(e.target.value)} 
                required
            />
            <button 
                className='text-[#000A14] flex-0 bg-secondaryGreen/90 w-fit p-4 rounded-lg text-center flex-1 disabled:bg-secondaryGreen/10'
                disabled={name ? false : true}
                onClick={handleAddName}
            >Add Person</button>
        </div>

        <div className='flex flex-row gap-3 flex-wrap items-center justify-center'>
            {
                people?.map((person, index) => (
                    <div key={person.id} className='text-themeWhite border border-themeWhite/20 rounded-lg p-3'>{person.name}</div>
                ))
            }
        </div>

        <button
            className='text-[#000A14] bg-secondaryGreen/90 w-fit p-2 px-8 rounded-lg text-center disabled:bg-secondaryGreen/10 font-bold'
            hidden={people?.length > 1 ? false : true}
            onClick={scrollToId}
            goto="add_expenses"
        >
            Next: Add Expenses
        </button>

    </section>

    <section
        id="add_expenses"
        className={`h-fit lg:h-dvh bg-primaryDarkBlue flex flex-col justify-center items-center gap-4 lg:gap-16 text-[#D6DDE6] ${people?.length > 1 ? "" : "hidden"} p-6 md:p-16 lg:p-20`}
    >
        <div className='flex-0 text-3xl lg:text-4xl xl:text-6xl text-center'>
            Add the <span className="underline decoration-secondaryGreen">expenses</span> you want to <span className="underline decoration-secondaryGreen">split</span>
        </div>

        <div className='flex flex-col lg:flex-row gap-12 h-fit lg:p-6 w-full'>
        
            <div className='flex flex-col gap-2 md:gap-4 h-full w-full'>

                <div className='flex flex-col md:flex-row gap-4 flex-wrap justify-center items-center p-4'>
                    <div className='flex flex-row items-center justify center gap-0 border-2 border-[#D6DDE6]/20 p-2 md:p-3 rounded-lg lg:pl-4 w-full lg:w-full'> 
                        <div> {/* Icon */}
                            <MdDriveFileRenameOutline />
                        </div>
                        <input 
                            className='rounded-lg p-2 pl-4 bg-primaryDarkBlue focus:outline-none focus:ring-0 flex-0 w-full'
                            placeholder='Name this expense'
                            type='text'
                            value={expenseName}
                            onChange={(e) => setExpenseName(e.target.value)}
                            required 
                        />
                        
                    </div>
                    <div className='flex flex-row items-center justify center gap-0 border-2 border-[#D6DDE6]/20 p-2 md:p-3 rounded-lg lg:pl-4 w-full lg:w-full'> 
                        <div> {/* Icon */}
                            <Image 
                                src={wallet}
                                alt="Wallet Icon | Splitzer"
                            />
                        </div>
                        <input 
                            className='rounded-lg p-2 pl-4 bg-primaryDarkBlue focus:outline-none focus:ring-0 flex-0 w-full'
                            placeholder='Enter amount'
                            type='number'
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required 
                        />
                        
                    </div>

                    <div className='flex flex-row items-center justify center gap-0 border-2 border-[#D6DDE6]/20 p-2 md:p-3 rounded-lg lg:pl-4 w-full lg:w-full'> 
                        <div> {/* Icon */}
                            <Image 
                                src={paidByImage}
                                alt="Paid By Icon | Splitzer"
                            />
                        </div>
                        <select
                            className='p-2 pl-4 bg-primaryDarkBlue focus:outline-none focus:ring-0 pr-4  w-full'
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                        >
                            <option value="" disabled>Paid By</option>
                            {people.map((person, index) => (
                                <option key={person.id} value={person.id}>{person.name}</option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className='flex flex-col gap-2.5 max-h-[70%] overflow-y-auto p-4'>
                    {people?.map((person, index) => (
                        <label key={person.id} className='flex flex-col items-center'>
                            <div className='flex flex-row border-2 border-themeWhite/20 rounded-lg p-2 md:p-3 gap-4 px-4 w-full'>
                                <span className='text-sm my-auto md:w-36'>{person.name}'s Share:</span>
                                <input
                                    type='number'
                                    placeholder='Default: 1'
                                    value={shares[person.id]}
                                    className='bg-primaryDarkBlue focus:border-secondaryGreen/50 focus:outline-none flex-grow'
                                    onChange={(e) => handleShareChange(person.id, e.target.value)} 
                                    required
                                />
                            </div>
                        </label>
                    ))}
                </div>
                
                <div className='flex justify-center items-center mt-2'>

                    <button 
                        className='flex flex-row gap-2 text-[#000A14] bg-secondaryGreen/90 p-2 px-6 rounded-lg text-center disabled:bg-secondaryGreen/10 center font-bold w-fit'
                        disabled={(expenseName && amount && paidBy && shares) ? false : true}
                        onClick={handleAddExpense}
                    >
                        <VscLoading className='my-auto animate-spin' hidden={addExpenseSpinner} />
                        {addExpenseCtaText}
                    </button>

                </div>

            </div>

            <div className='h-full w-full'>
                <div className='flex flex-col h-full lg:h-[80%] lg:overflow-y-auto lg:pr-8 w-full items-center justify-start'>
                    {
                        expenses?.map((expense, index) => (
                            <div key={expense.id} className="flex flex-row gap-4 p-2 lg:p-1 items-center justify-center w-full">
                                <div className='flex flex-col flex-grow'>
                                    <div className={`flex flex-row border-x-2 border-t-2 border-themeWhite/20 gap-28 lg:gap-64 p-2 rounded-t-lg ${expenseBox[expense.id]? "" : "border-b-2 rounded-b-lg"} w-full pl-4 text-sm`}>
                                        <div className='my-auto font-bold'>{expense.expense_name}</div>
                                        <div className='flex flex-row gap-6 w-full justify-end'>
                                            <div className='flex flex-col w-full items-end'>
                                                <div className='font-bold'>{expense.expense_amount}</div>
                                                <div className='text-[7px]'>Paid By: {getPersonNameById(expense.paid_by_people_id)}</div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    handleExpenseCollapse(expense)
                                                }}
                                            >
                                                <IoIosArrowDown className='my-auto' hidden={collapseAcc[expense.id] ? collapseAcc[expense.id] : false} />
                                                <IoIosArrowUp className='my-auto' hidden={!collapseAcc[expense.id]} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className='p-8 border-x-2 border-b-2 border-themeWhite/20 rounded-b-lg' hidden={!expenseBox[expense.id]}>
                                        <div className='flex flex-col gap-3'>
                                            {Object.entries(expense.expense_division).map(([personId, share]) => (
                                                <div key={personId} className='flex flex-row justify-start gap-2 w-full border-b-2 border-themeWhite/10 p-2 text-sm '>
                                                    <div className='w-1/2 lg:w-3/4'>{getPersonNameById(parseInt(personId))}</div>
                                                    <div>{share} Share(s)</div>
                                                </div>
                                            ))} 
                                        </div>
                                    </div>
                                </div>
                                <div className='my-auto'>
                                    <button
                                        onClick={() => handleDeleteExpense(expense.id)}
                                        disabled={deleteExpenseSpinner[expense.id]}
                                    >
                                        <VscLoading className='my-auto animate-spin' hidden={!deleteExpenseSpinner[expense.id]} />
                                        <MdDelete hidden={deleteExpenseSpinner[expense.id]} />
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                    
                </div>
            </div>

        </div>

        <button
            className={`flex flex-row gap-2 text-[#000A14] bg-secondaryGreen/90 p-2 px-6 rounded-lg text-center disabled:bg-secondaryGreen/10 center font-bold w-fit ${expenses?.length > 0 ? "" : "hidden"}`}
            onClick={handleCalculateExpenses}
            goto="calculated_split"
        >
            <VscLoading className='my-auto animate-spin' hidden={calculateSpinner} />
            {calculateCTA}
        </button>

    </section>

    <section
        id="calculated_split"
        className={`h-dvh lg:h-dvh bg-primaryDarkBlue flex flex-col items-center gap-20 text-[#D6DDE6] ${expenses?.length > 0 ? "" : "hidden"} p-6 md:p-0`}
    >
        <div className='flex-0 text-3xl lg:text-4xl xl:text-6xl text-center justify-center mt-16'>
            Here's your <span className="underline decoration-secondaryGreen">simiplified</span> bill split
        </div>
        <div className='flex flex-col gap-4 text-xl'>
            <div>
                Who pays whom & how much
            </div>
            {
                splits.map((split, index) => (
                    <div key={index} className='flex flex-row justify-center gap-4 border-2 border-themeWhite/20 rounded-lg p-4'>
                        <div>{split.debtor_name}</div>
                        <div className='flex flex-row gap-1 text-secondaryGreen'>{split.settle_amount}<FaArrowRightLong className='my-auto fill-secondaryGreen' /></div>
                        <div>{split.creditor_name}</div>
                    </div>
                ))
            }
            
        </div>
        
    </section>
    </>
  )
}

export default BillPage