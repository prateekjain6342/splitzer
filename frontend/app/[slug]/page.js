"use client"

import React from 'react'
import { BorderBeam } from "@/components/ui/border-beam";
import PulsatingButton from '@/components/ui/pulsating-button';
import { fireApiAction } from '@/config/api';
import { RainbowButton } from '@/components/ui/rainbow-button';

const BillPage = ({ params }) => {
    async function addName(name) {
        const result = await fireApiAction("api/post", "POST", {"action": "add_people", "uuid": slug, "name": name})
        return result.name;
    }
    async function getNames() {
        const result = await fireApiAction("api/create?action=get_people", "GET", {"uuid": slug})
        console.log(result)
        let new_people_list = []
        result.map((person) => {
            new_people_list.push(person)
        }, [])
        setPeople(new_people_list);
        return result.data;
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
    const [shares, setShares] = React.useState(people.map(person => ({[person.id]: 1})).reduce((acc, val) => Object.assign(acc, val), {}));
    const [expenses, setExpenses] = React.useState([]);
    const [splits, setSplits] = React.useState([]);

    const handleAddName = async () => {
        if (name.trim() !== "") {
            await addName(name);
            await getNames()
            setName("");
        }
    };

    async function handleAddExpense () {
        const result = await fireApiAction("api/post", "POST", {"action": "add_expense", "uuid": slug,
            "expense_name": expenseName,
            "expense_amount": amount,
            "paid_by": paidBy,
            "expense_division": shares
        })
        await getExpenses();
        return result;
    };

    const handleShareChange = (person, value) => {
        setShares({
            ...shares,
            [person]: value
        });
    };

    const getPersonNameById = (id) => {
        const person = people.find(p => p.id === id);
        return person ? person.name : 'Unknown';
    };

    const handleDeleteExpense = async (expenseId) => {
        await fireApiAction("api/post", "POST", {"action": "delete_expense", "uuid": slug, "old_expense_id": expenseId});
        await getExpenses();
    };

    const handleCalculateExpenses = async (expenseId) => {
        let res = await fireApiAction("api/post", "POST", {"action": "calculate_split", "uuid": slug});
        setSplits(res.data)
    };

    const handleCopyURL = () => {
        navigator.clipboard.writeText(window.location.href)
        .then(() => {
            alert('URL copied to clipboard');
        }).catch((error) => {
            alert('Failed to copy URL');
        });
    } 
    
    React.useEffect(() => {
        getNames()
        getExpenses()
    }, [])

  return (
    <div
        className='flex flex-row h-full flex-wrap items-center justify-center m-auto'
    >
        <div className='flex flex-col items-center justify-center h-auto gap-6 w-full md:w-1/3'>
        <div
            className='p-3'
        >
            <span
                className='pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10'
            >Add People</span>
        </div>
        <div 
            className='flex flex-row items-center justify-center gap-3'
        >
            <input type='text' placeholder='Enter Your Name' className='font-sans border-2 rounded-lg h-12 pl-4'
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            <button className='px-4 bg-slate-950 border-0 text-white h-12 rounded-lg'
                onClick={handleAddName}
            >Add</button>
        </div>
        <div className='mt-4'>
            <ul className='flex flex-row flex-wrap items-center justify-center gap-3'>
                {
                    people.map((person, index) => (
                        <li key={person.id} className='px-4 text-center py-2 border-2 rounded-full'>{person.name}</li>
                    ))
                }
            </ul>
        </div>
        </div>
        {/* Expense */}
        <div className='flex flex-col items-center justify-center h-auto gap-2 w-full mt-4 md:w-2/3'>
        <div
            className='p-3'
        >
            <span
                className='pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10'
            >Add Expenses</span>
        </div>
        <div className='w-full flex flex-col gap-3 border-2 p-4 rounded-lg mb-12 md:w-2/3'>
                    <input 
                        type='text' 
                        placeholder='Expense Name' 
                        className='font-sans border-2 rounded-lg h-12 pl-4' 
                        value={expenseName} 
                        onChange={(e) => setExpenseName(e.target.value)} 
                    />
                    <select 
                        className='font-sans border-2 rounded-lg h-12 pl-4' 
                        value={paidBy} 
                        onChange={(e) => setPaidBy(e.target.value)}
                    >
                        <option value=''>Paid By</option>
                        {people.map((person, index) => (
                            <option key={person.id} value={person.id}>{person.name}</option>
                        ))}
                    </select>
                    <input 
                        type='number' 
                        placeholder='Amount' 
                        className='font-sans border-2 rounded-lg h-12 pl-4' 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                    />
                    <div className='flex flex-col'>
                        {people.map((person, index) => (
                            <div key={person.id} className='flex flex-row items-center justify-between mb-1'>
                                <span className='w-1/3 text-center'>{person.name}</span>
                                <input 
                                    type='number' 
                                    placeholder='Shares' 
                                    className='font-sans border-2 rounded-lg h-12 pl-4 flex-grow' 
                                    value={shares[person.id]}
                                    onChange={(e) => handleShareChange(person.id, e.target.value)} 
                                    required
                                />
                            </div>
                        ))}
                    </div>
                    <button 
                        className='px-4 bg-slate-950 border-0 text-white h-12 rounded-lg mt-2' 
                        onClick={handleAddExpense}
                    >
                        Add Expense
                    </button>
                
        </div>
        
            </div>
            <div className='flex h-auto w-full my-8 md:pl-8 md:w-1/2 overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Expense Name
                            </th>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Paid By
                            </th>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Amount
                            </th>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Shares
                            </th>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {expenses.map((expense, index) => (
                            <tr key={index}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                    {expense.expense_name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {getPersonNameById(expense.paid_by_people_id)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {expense.expense_amount}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {Object.entries(expense.expense_division).map(([personId, share]) => (
                                        <div key={personId}>{getPersonNameById(parseInt(personId))}: {share}</div>
                                    ))}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    <button 
                                        className='px-2 py-1 bg-red-500 text-white rounded' 
                                        onClick={() => handleDeleteExpense(expense.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> 
            <div className='flex flex-col items-center justify-center h-auto w-full max-w-md'>
                    <RainbowButton onClick={handleCalculateExpenses}>Calculate</RainbowButton>
                    <div className='flex items-center justify-center h-auto w-2/3 my-8'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Debtor Name
                            </th>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Creditor Name
                            </th>
                            <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Settle Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {splits.map((split, index) => (
                            <tr key={index}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                    {split.debtor_name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {split.creditor_name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {split.settle_amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
            <div className='flex flex-col items-center justify-center h-auto w-full md:w-1/2 my-8'>
                <RainbowButton  
                    onClick={handleCopyURL}
                >
                    Share
                </RainbowButton>
            </div>
    </div>
  )
}

export default BillPage