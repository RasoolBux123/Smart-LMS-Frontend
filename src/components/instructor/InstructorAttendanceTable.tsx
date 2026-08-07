"use client";


import { useState } from "react";


type Status =
    | "present"
    | "absent"
    | "half_day"
    | "leave"
    | "not_marked";



interface Student {

    id: string;

    name: string;

    roll_no: string;

    email: string;

    status: Status;

}



const students: Student[] = [];



const statusStyle = {

    present:
        "bg-green-100 text-green-700",

    absent:
        "bg-red-100 text-red-700",

    half_day:
        "bg-yellow-100 text-yellow-700",

    leave:
        "bg-blue-100 text-blue-700",

    not_marked:
        "bg-gray-100 text-gray-600"

};



function StatusBadge(
    {
        status
    }: {
        status: Status
    }

) {


    const labels: any = {

        present: "Present",

        absent: "Absent",

        half_day: "Half Day",

        leave: "Leave",

        not_marked: "Not Marked"

    };



    return (

        <span
            className={`
px-3 py-1 rounded-full text-sm
${statusStyle[status]}
`}
        >

            ● {labels[status]}

        </span>

    );


}




export default function InstructorAttendanceTable() {



    const [records, setRecords] =
        useState(students);



    function changeStatus(
        id: string,
        status: Status
    ) {


        setRecords(
            prev =>
                prev.map(
                    student =>
                        student.id === id
                            ?
                            {
                                ...student,
                                status
                            }
                            :
                            student
                )

        );


    }




    return (

        <div className="border rounded-xl overflow-hidden">


            <table className="w-full">


                <thead className="bg-gray-50">

                    <tr>


                        <th className="p-4 text-left">
                            #
                        </th>


                        <th className="p-4 text-left">
                            Student Name
                        </th>


                        <th className="p-4 text-left">
                            Roll No
                        </th>


                        <th className="p-4 text-left">
                            Email
                        </th>


                        <th className="p-4 text-left">
                            Status
                        </th>


                        <th className="p-4 text-left">
                            Action
                        </th>


                    </tr>

                </thead>



                <tbody>


                    {
                        records.length === 0

                            ?

                            <tr>

                                <td
                                    colSpan={6}
                                    className="p-10 text-center text-gray-500"
                                >

                                    No students found. Select course to load students.

                                </td>

                            </tr>


                            :


                            records.map(
                                (student, index) => (


                                    <tr
                                        key={student.id}
                                        className="border-t"
                                    >


                                        <td className="p-4">
                                            {index + 1}
                                        </td>


                                        <td className="p-4 font-medium">
                                            {student.name}
                                        </td>


                                        <td className="p-4">
                                            {student.roll_no}
                                        </td>


                                        <td className="p-4">
                                            {student.email}
                                        </td>


                                        <td className="p-4">

                                            <StatusBadge
                                                status={student.status}
                                            />

                                        </td>



                                        <td className="p-4">


                                            <select

                                                onChange={
                                                    e =>
                                                        changeStatus(
                                                            student.id,
                                                            e.target.value as Status
                                                        )
                                                }

                                                className="border rounded-lg px-3 py-2"

                                            >


                                                <option>
                                                    Change
                                                </option>

                                                <option value="present">
                                                    Present
                                                </option>


                                                <option value="absent">
                                                    Absent
                                                </option>


                                                <option value="half_day">
                                                    Half Day
                                                </option>


                                                <option value="leave">
                                                    Leave
                                                </option>


                                            </select>


                                        </td>


                                    </tr>


                                )

                            )

                    }



                </tbody>


            </table>



            <div className="p-4 flex justify-end">


                <button

                    className="
bg-black text-white
px-6 py-2
rounded-lg
"

                >

                    Save Attendance

                </button>


            </div>


        </div>

    );


}