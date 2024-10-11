import React from 'react'

export default function AddTableMsg() {
  return (
    <div className='second table-msg' style={{
      color:"black",
      textAlign:"center",
      margin:"auto 0",
      fontSize:"2.5rem"
      }}>
      <table>
        <tr >
          <th >S.No</th>
          <th >name</th>
          <th >count</th>
          <th >city</th>
        </tr>
        <tr >
          <td>1</td>
          <td>anuj</td>
          <td>data</td>
          <td >mumbai</td>
        </tr>
      </table>
    </div>
  )
}
