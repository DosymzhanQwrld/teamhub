import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "TeamHub",
  description: "Project collaboration platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
