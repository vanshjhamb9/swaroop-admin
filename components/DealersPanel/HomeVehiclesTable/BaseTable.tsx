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
  Typography,
} from "@mui/material";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import useVehicleStore from "@/store/dealersPanel/Vehiclestore";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
import useAdminOwnerStore from "@/store/adminPanel/AdminOwnersInfo";
import { useQuery } from "@tanstack/react-query";

const fetchVehicles = async (uid: string): Promise<vehicle[]> => {
  const vehicles = await getDocs(collection(db, "dealers", uid, "vehicles"));
  const v: any = [];
  vehicles.forEach((ve) => v.push({ ...ve.data(), id: ve.id }));
  return v;
};

function BaseTable() {
  const { setVehicle } = useVehicleStore();
  const { info } = useOwnersStore();
  const { info: adminInfo } = useAdminOwnerStore();
  const router = useRouter();
  const {
    data: vehicles,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<vehicle[], Error>({
    queryKey: ["vehicles", info.uid], // Object key
    queryFn: () => fetchVehicles(info.uid), // Fetch function
    enabled: !!info.uid, // Ensure the query runs only if `info.uid` is defined
    staleTime: 2 * 60 * 1000,
  });
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching vehicles</div>;

  if (vehicles?.length == 0) return <Typography>No Vehicles Yet</Typography>;
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Registration Number</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles?.map((vehicle: any) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.id}</TableCell>
              <TableCell>{vehicle.name}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.registration}</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    setVehicle(vehicle);
                    if (adminInfo.uid) {
                      router.push(
                        "/admin_panel/manage_dealers/View_dealer/View_vehicle"
                      );
                    } else {
                      router.push("/dealersPanel/ViewVehicle");
                    }
                  }}
                >
                  View
                </Button>
                {!adminInfo.uid && (
                  <Button
                    variant="text"
                    color="warning"
                    onClick={() => {
                      setVehicle(vehicle, true);
                      router.push("/dealersPanel/add_vehicle?edit=true");
                    }}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="text"
                  color="error"
                  onClick={() => {
                    toast.info("Deleting");
                    deleteDoc(
                      doc(db, "dealers", info.uid, "vehicles", vehicle.id)
                    )
                      .then((d) => toast.success("Vehicle Deleted"))
                      .catch((e) => toast.error("Vehicle Couldnt Be Deleted"));
                  }}
                >
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

export default BaseTable;
