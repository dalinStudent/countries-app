import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  InputAdornment,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import Fuse from "fuse.js";

interface Column {
  id: "flag" | "name" | "cca2" | "cca3" | "nativeName" | "altSpellings" | "idd";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

interface StringColumn extends Column {
  id: "name" | "cca2" | "cca3" | "idd" | "altSpellings" | "nativeName";
}

const columns: readonly (StringColumn | Column)[] = [
  {
    id: "flag",
    label: "Flag",
    minWidth: 170,
  },
  {
    id: "name",
    label: "Country Name",
    minWidth: 170,
  },
  {
    id: "cca2",
    label: "Country Code",
    minWidth: 170,
  },
  {
    id: "cca3",
    label: "Country Code",
    minWidth: 170,
  },
  {
    id: "nativeName",
    label: "Native Country Names",
    minWidth: 170,
  },
  {
    id: "altSpellings",
    label: "Alternative Country Name",
    minWidth: 170,
  },
  {
    id: "idd",
    label: "Calling Country Code",
    minWidth: 170,
  },
];

interface NativeNameEntry {
  official: string;
}

interface Country {
  flags: { png: string };
  name: { official: string; nativeName: { [key: string]: NativeNameEntry } };
  cca2: string;
  cca3: string;
  altSpellings: string[];
  idd: { root: string };
}

const List = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<keyof Country>("name");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://restcountries.com/v3.1/all");
      setCountries(response.data);
    } catch (error) {
      console.error("Error :", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const fuseOptions = {
    keys: ["name.official"],
    threshold: 0.3,
  };

  const fuse = new Fuse(countries, fuseOptions);
  const filteredCountries = search ? fuse.search(search) : countries;

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleSort = (columnId: keyof Country) => {
    const isSameColumn = sortColumn === columnId;

    const newSortOrder = isSameColumn && sortOrder === "asc" ? "desc" : "asc";

    setSortColumn(columnId);
    setSortOrder(newSortOrder);

    setCountries((prevCountries) => {
      const sorted = prevCountries.slice().sort((a, b) => {
        const aValue = a.name.official.toLowerCase();
        const bValue = b.name.official.toLowerCase();

        if (newSortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      return sorted;
    });
  };

  return (
    <Grid container>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            p: 4,
            maxWidth: 600,
          }}
        >
          <Card sx={{ maxWidth: 345 }}>
            <CardMedia
              sx={{ height: "auto", maxWidth: 400, margin: "auto" }}
              component="img"
              image={selectedCountry?.flags.png}
              title="flag"
            />
            <CardContent>
              <Typography>
                <p>
                  Country Name:{" "}
                  <span style={{ color: "blue" }}>
                    {selectedCountry?.name.official}
                  </span>
                </p>
              </Typography>

              <Typography>
                <p>
                  Country Code:{" "}
                  <span style={{ color: "blue" }}>{selectedCountry?.cca2}</span>
                </p>
              </Typography>
              <Typography>
                <p>
                  Country Code:{" "}
                  <span style={{ color: "blue" }}>{selectedCountry?.cca3}</span>
                </p>
              </Typography>
              <Typography>
                <p>
                  Native Country Name:{" "}
                  <span style={{ color: "blue" }}>
                    {" "}
                    {selectedCountry?.name.nativeName &&
                      Object.entries(selectedCountry?.name.nativeName).map(
                        ([languageCode, nativeNameEntry]) => (
                          <span key={languageCode}>
                            {nativeNameEntry.official}
                            {", "}
                          </span>
                        )
                      )}
                  </span>
                </p>
              </Typography>

              <Typography>
                <p>
                  Alternative Country Name:{" "}
                  <span style={{ color: "blue" }}>
                    {" "}
                    {selectedCountry?.altSpellings.join(", ")}
                  </span>
                </p>
              </Typography>
              <Typography>
                <p>
                  Calling Country Code:{" "}
                  <span style={{ color: "blue" }}>
                    {" "}
                    {selectedCountry?.idd.root}
                  </span>
                </p>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Modal>
      <Grid item xs={12}>
        <Box sx={{ ml: "90px", width: "20%" }}>
          <TextField
            label="Search"
            value={search}
            onChange={handleSearchChange}
            sx={{ mb: 2, mt: 5, width: "100%" }}
          />
        </Box>

        <Paper sx={{ width: "90%", margin: "0 auto" }}>
          <TableContainer sx={{ maxHeight: 700 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead
                sx={{ textAlign: "center", backgroundColor: "#FFFFE0" }}
              >
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                      sx={{ backgroundColor: "#FFFFE0" }}
                    >
                      {column.id === "name" ? (
                        <TableSortLabel
                          active={sortColumn === "name"}
                          direction={sortOrder}
                          onClick={() => handleSort("name")}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        <>{column.label}</>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCountries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCountries
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((data) => {
                      const country: Country =
                        "item" in data ? data.item : data;
                      return (
                        <TableRow hover key={country.name.official}>
                          <TableCell>
                            {country.flags && country.flags.png ? (
                              <img
                                src={country.flags.png}
                                alt="Flag"
                                style={{ height: "40px" }}
                              />
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell
                            onClick={() => handleCountryClick(country)}
                            style={{ cursor: "pointer" }}
                          >
                            {country.name.official}
                          </TableCell>
                          <TableCell>{country.cca2}</TableCell>
                          <TableCell>{country.cca3}</TableCell>
                          <TableCell>
                            {country.name.nativeName &&
                              Object.entries(country.name.nativeName).map(
                                ([languageCode, nativeNameEntry]) => (
                                  <span key={languageCode}>
                                    {nativeNameEntry.official}
                                    {", "}
                                  </span>
                                )
                              )}
                          </TableCell>
                          <TableCell>
                            {country.altSpellings.join(", ")}
                          </TableCell>
                          <TableCell>{country.idd.root}</TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={countries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default List;
