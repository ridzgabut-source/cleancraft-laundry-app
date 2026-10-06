import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { mockApi } from "../../lib/mockApi";
import { Brand } from "../../components/common/Navbar";
import { LaundryVisual } from "../../components/common/LaundryVisual";
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@cleancraft.id");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await mockApi.adminLogin(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login gagal. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand />
        <h1>
          Di balik cucian bersih,
          <br />
          ada tim yang peduli.
        </h1>
        <p>
          Satu ruang untuk mengatur pesanan, merawat pelanggan,
          <br />
          dan membuat operasional studio lebih ringan.
        </p>
        <LaundryVisual kind="washer" />
      </section>
      <main className="login-form-side">
        <div className="login-form">
          <span className="eyebrow mb-3">CLEANCRAFT WORKSPACE</span>
          <h2>Selamat datang kembali.</h2>
          <p>Masuk dan siapkan hari yang segar untuk pelangganmu.</p>
          {error && (
            <div role="alert" className="login-error">
              {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div>
              <label htmlFor="admin-email">Email admin</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <p className="login-demo">
              Akun demo sudah terisi.
              <br />
              admin@cleancraft.id · password: admin123
            </p>
            <button
              type="submit"
              disabled={loading}
              className="button button-primary"
            >
              {loading ? "Sedang masuk…" : "Masuk ke workspace"}
              <ArrowRight size={17} />
            </button>
          </form>
          <Link to="/" className="text-link">
            <ArrowLeft size={15} /> Kembali ke website pelanggan
          </Link>
        </div>
      </main>
    </div>
  );
}
