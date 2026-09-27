import React from "react";

export const Seal = ({ size = 120, className = "", idPrefix = "seal" }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-label="H&SI seal">
    <defs>
      <path id={`${idPrefix}-top`} d="M 26,100 a 74,74 0 0,1 148,0" fill="none" />
      <path id={`${idPrefix}-bottom`} d="M 26,100 a 74,74 0 0,0 148,0" fill="none" />
    </defs>
    <circle cx="100" cy="100" r="95" fill="none" stroke="#E3161B" strokeWidth="6" />
    <path d="M 34,100 A 66,66 0 0,1 166,100" fill="none" stroke="#E3161B" strokeWidth="4" />
    <path d="M 166,100 A 66,66 0 0,1 34,100" fill="none" stroke="#E3161B" strokeWidth="4" />
    <text fontSize="16.5" fontWeight="700" fill="#0E7A34" letterSpacing="3.5" fontFamily="Georgia, serif">
      <textPath href={`#${idPrefix}-top`} startOffset="50%" textAnchor="middle">
        HLMC&#8217;S ENTERPRISE
      </textPath>
    </text>
    <text fontSize="16.5" fontWeight="700" fill="#0E7A34" letterSpacing="3.5" fontFamily="Georgia, serif">
      <textPath href={`#${idPrefix}-bottom`} startOffset="50%" textAnchor="middle">
        SERVICES, INC.
      </textPath>
    </text>
    <text x="100" y="118" textAnchor="middle" fontSize="46" fontWeight="800" fill="#E3161B" fontFamily="'Playfair Display', Georgia, serif">
      H<tspan fontStyle="italic" fontSize="38">&#38;</tspan>SI
    </text>
  </svg>
);

export default Seal;
