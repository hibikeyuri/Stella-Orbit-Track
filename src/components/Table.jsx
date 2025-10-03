// import React, { useContext } from "react";

import clsx from "clsx";
import { createContext, useContext } from "react";

// const columnstyle =
//   "grid grid-cols-[1fr_0.8fr_1fr_0.8fr_1.2fr_2.2fr_2.2fr_0.8fr_0.8fr] min-w-[1400px] px-4 py-2";

function StyledTable({ children, role = "table" }) {
  return (
    <div
      role={role}
      className="border-grey-200 min-w-[1400px] rounded-lg border text-[1rem]"
    >
      {children}
    </div>
  );
}

function CommonRow({ children, columns, className, role = "row" }) {
  return (
    <div
      role={role}
      className={clsx("grid items-center transition-none", columns, className)}
    >
      {children}
    </div>
  );
}

function StyledHeader({ children, columns, role = "row" }) {
  return (
    <CommonRow
      role={role}
      columns={columns}
      className="border-grey-100 bg-grey-300 text-grey-600 border-b py-2 font-semibold uppercase"
    >
      {children}
    </CommonRow>
  );
}

function StyledBody({ children }) {
  return (
    <div className="bg-grey-0 my-1 min-w-[1400px]">{children}</div>
  );
}

function Empty({ children }) {
  return (
    <p className="my-6 text-center text-[1.6rem] font-medium">{children}</p>
  );
}

function Footer({ children }) {
  if (!children) return null;

  return (
    <div className="bg-grey-50 flex justify-center px-6 py-3">
      {children}
    </div>
  );
}

const TableContext = createContext();

export function Table({ columns, children }) {
  return (
    <TableContext.Provider value={{ columns }}>
      <StyledTable role="table">{children}</StyledTable>
    </TableContext.Provider>
  );
}

function Header({ children }) {
  const { columns } = useContext(TableContext);
  return (
    <StyledHeader role="row" columns={columns}>
      {children}
    </StyledHeader>
  );
}

function Row({ children }) {
  const { columns } = useContext(TableContext);
  return (
    <CommonRow role="row" columns={columns}>
      {children}
    </CommonRow>
  );
}

function Body({ data, render }) {
  if (!data || data.length === 0) return <Empty>No data</Empty>;
  return <StyledBody>{data.map(render)}</StyledBody>;
}

Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Footer = Footer;

// export function Table({
//   header,
//   children,
//   footer,
//   emptyMessage = "No data found.",
// }) {
//   return (
//     <div className="border-grey-200 min-w-[1400px] rounded-lg border text-[1rem]">
//       {/* Header */}
//       <div>{header}</div>

//       {/* Body */}
//       <div className="bg-grey-0 my-1 min-w-[1400px]" role="row">
//         {children ? (
//           children
//         ) : (
//           <p className="my-6 text-center text-[1.6rem] font-medium">
//             {emptyMessage}
//           </p>
//         )}
//       </div>

//       {/* Footer */}
//       {footer && (
//         <footer className="bg-grey-50 flex justify-center px-6 py-3">
//           {footer}
//         </footer>
//       )}
//     </div>
//   );
// }

// function TableHeader({ children, className }) {
//   return (
//     <div
//       className={clsx(
//         "border-grey-100 bg-grey-300 text-grey-600 grid border-b font-semibold uppercase",
//         className,
//       )}
//     >
//       {children}
//     </div>
//   );
// }
