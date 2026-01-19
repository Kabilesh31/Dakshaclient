import React from "react";
import Icon from "../icon/Icon";
import { Pagination, PaginationLink, PaginationItem } from "reactstrap";

const PaginationNext= ({ itemPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];

   // Always add 1 as the first page number
   pageNumbers.push(1);

   for (let i = 2; i <= Math.ceil(totalItems / itemPerPage); i++) {
     pageNumbers.push(i);
   }
 
   const nextPage = () => {
     paginate(currentPage + 1);
   };
 
   const prevPage = () => {
     paginate(currentPage - 1);
   };
 
   const renderPageNumbers = () => {
     const visiblePages = 1; // Number of pages to show before and after current page
     const currentPageIndex = pageNumbers.indexOf(currentPage);
     let start = currentPageIndex - visiblePages;
     let end = currentPageIndex + visiblePages;
 
     if (start < 0) {
       end += Math.abs(start);
       start = 0;
     }
 
     if (end >= pageNumbers.length) {
       start -= end - pageNumbers.length + 1;
       end = pageNumbers.length - 1;
     }
 
     const visiblePageNumbers = pageNumbers.slice(start, end + 1);
 
     return visiblePageNumbers.map((item) => (
       <PaginationItem className={currentPage === item ? "active" : ""} key={item}>
         <PaginationLink
           tag="a"
           href="#pageitem"
           onClick={(ev) => {
             ev.preventDefault();
             paginate(item);
           }}
         >
           {item}
         </PaginationLink>
       </PaginationItem>
     ));
   };
 
   return (
     <Pagination aria-label="Page navigation example">
       <PaginationItem disabled={currentPage === 1}>
         <PaginationLink
           className="page-link-prev"
           onClick={(ev) => {
             ev.preventDefault();
             prevPage();
           }}
           href="#prev"
         >
           <Icon name="chevrons-left" />
           <span>Prev</span>
         </PaginationLink>
       </PaginationItem>
       {renderPageNumbers()}
       <PaginationItem disabled={currentPage === pageNumbers[pageNumbers.length - 1]}>
         <PaginationLink
           className="page-link-next"
           onClick={(ev) => {
             ev.preventDefault();
             nextPage();
           }}
           href="#next"
         >
           <span>Next</span>
           <Icon name="chevrons-right" />
         </PaginationLink>
       </PaginationItem>
     </Pagination>
   );
 };
 
export default PaginationNext;
