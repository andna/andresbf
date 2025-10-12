import React from "react";

export default function ExtrasList({ items = [] }) {
  return (
    <ul className="port-extras">
      {items.map((item, index) => (
        <li key={index}>
          <span>{item.icon}</span> 
          {item.title}
          {item.description && (
            <>
              <br />
              <small>{item.description}</small>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
