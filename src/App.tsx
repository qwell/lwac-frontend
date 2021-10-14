import React, { ChangeEvent, FormEvent } from "react";
import logo from "./logo.svg";
import "./App.css";

import superagent from "superagent";
import prefix from "superagent-prefix";
import evalidator from "email-validator";
import { useTable } from "react-table";
import styled from "styled-components";

const Styles = styled.div`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
`;

interface IProps {}

interface IState {
  email: string;
  breaches: any;
}

class PwnedForm extends React.Component<IProps, IState> {
  private backendPort: number = 3001;

  constructor(props: IProps) {
    super(props);

    this.state = {
      email: "",
      breaches: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getBreaches = (email: string) => {
    return superagent
      .get("/breaches")
      .use(prefix("http://localhost:" + this.backendPort))
      .query({ email: email })
      .then((res) => {
        return res.body;
      })
      .catch((err) => {});
  };

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!evalidator.validate(this.state.email)) {
      return;
    }

    this.getBreaches(this.state.email).then((list) => {
      // Display the breaches.
      this.setState({ breaches: list });
    });
  };

  handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  render() {
    const columns = [
      {
        Header: "Breach",
        columns: [
          {
            Header: "Name",
            accessor: "Name",
          },
        ],
      },
    ];

    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" onChange={this.handleChange} />
        <button type="submit">Submit</button>
        <Styles>
          <Table columns={columns} data={this.state.breaches} />
        </Styles>
      </form>
    );
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <PwnedForm />
      </header>
    </div>
  );
}

interface ITable {
  columns: any;
  data: any;
}

function Table({ columns, data }: ITable) {
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
  } = useTable({
    columns,
    data,
  });

  /* 
    Render the UI for your table
    - react-table doesn't have UI, it's headless. We just need to put the react-table props from the Hooks, and it will do its magic automatically
  */
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default App;
