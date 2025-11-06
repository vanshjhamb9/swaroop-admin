"use client";
import React, { useEffect, useState } from "react";
import {
  TableContainer,
  TableRow,
  TableCell,
  Button,
  Table,
  TableHead,
  TableBody,
  Paper,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
function AllDealersTable() {
  const [dealers, setdealers] = useState<any>([]);
  const { setinfo } = useOwnersStore();
  const fetchdealers = async () => {
    try {
      const dealers = await getDocs(collection(db, "dealers"));
      const v: any = [];
      dealers.forEach((ve) => v.push({ ...ve.data(), id: ve.id }));
      setdealers(v);
    } catch (e) {
      toast.error("couldnt Fetch dealers");
    }
  };
  useEffect(() => {
    fetchdealers();
  }, []);
  const router = useRouter();
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dealers.map((dealer: any) => (
            <TableRow key={dealer.id}>
              <TableCell>{dealer.name}</TableCell>
              <TableCell>{dealer.email}</TableCell>
              <TableCell>{dealer.contactDetails}</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    setinfo({
                      uid: dealer.id,
                      email: dealer.email,
                      name: dealer.name,
                      contactDetails: dealer.contactDetails,
                      vehicles: dealer.vehicles,
                    });
                    router.push("/admin_panel/manage_dealers/View_dealer");
                  }}
                >
                  View
                </Button>
                {/* <Button variant="text" color="warning" onClick={() => {}}>
                  Edit
                </Button> */}
                <Button variant="text" color="error">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AllDealersTable;
