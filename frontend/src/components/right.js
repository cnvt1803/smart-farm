import {
  FaRegCalendarAlt,
  FaRegClock,
  FaMapMarkerAlt,
  FaTint,
  FaLeaf,
  FaSun,
} from "react-icons/fa";
import headerImage from "../assets/monitor.jpg";
import avarta1 from "../assets/avarta1.png";
import avarta2 from "../assets/avarta2.png";
import avarta3 from "../assets/avarta3.jpeg";
const harvestData = [
  { title: "Smart farm", date: "Aug 10, 2025", time: "09 am", image: avarta1 },
  { title: "Smart farm", date: "Aug 11, 2025", time: "09 am", image: avarta2 },
  { title: "Smart farm", date: "Aug 12, 2025", time: "09 am", image: avarta3 },
];

function Stat({ icon, label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
      <div className="flex items-center gap-2 text-white/80 text-xs">
        {icon}<span>{label}</span>
      </div>
      <div className={`mt-1 text-xl font-semibold ${color}`}>{value ?? "—"}</div>
    </div>
  );
}

export default function HarvestSchedule({
  province = "Quang Ngai",
  humidity,    // %
  soilPercent, // %
  lux,         // lx
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const tip = (() => {
    if (Number.isFinite(soilPercent) && soilPercent < 35) return "Soil is dry — water this evening for 10–15 minutes.";
    if (Number.isFinite(humidity) && humidity > 85)       return "High humidity — watch for fungal diseases.";
    return "Conditions look fine — keep your regular schedule.";
  })();

  return (
    <aside className="overflow-hidden rounded-3xl shadow-lg bg-white">
      {/* Banner (không overlay chip) */}
      <div className="relative w-full h-64 md:h-72 lg:h-80">
        <img
          src={headerImage}
          alt="Harvest illustration"
          className="h-full w-full object-cover"
        />
        {/* overlay dày hơn để ăn xuống ảnh đẹp hơn */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f2740] to-transparent" />
      </div>

      {/* Panel tối */}
      <section className="-mt-6 bg-[#183654] text-white px-6 pb-8 pt-8 rounded-t-3xl">
        {/* Chips địa điểm / ngày / giờ – ở giữa, trong flow */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-wrap mt-4 items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 text-[#0f2740] text-xs font-medium shadow">
              <FaMapMarkerAlt /> {province}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 text-[#0f2740] text-xs font-medium shadow">
              <FaRegCalendarAlt /> {dateStr}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 text-[#0f2740] text-xs font-medium shadow">
              <FaRegClock /> {timeStr}
            </span>
          </div>
        </div>

        {/* Today overview */}
        <h2 className="mt-6 mb-5 text-3xl font-extrabold tracking-tight">Today overview</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat
            icon={<FaTint className="text-sky-300" />}
            label="Humidity"
            value={Number.isFinite(humidity) ? `${humidity.toFixed(0)}%` : "—"}
            color="text-sky-200"
          />
          <Stat
            icon={<FaLeaf className="text-emerald-300" />}
            label="Soil"
            value={Number.isFinite(soilPercent) ? `${soilPercent.toFixed(0)}%` : "—"}
            color="text-emerald-200"
          />
          <Stat
            icon={<FaSun className="text-violet-300" />}
            label="Light"
            value={Number.isFinite(lux) ? `${Math.round(lux)} lx` : "—"}
            color="text-violet-200"
          />
        </div>

        {/* Tip */}
        <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 p-4 text-blue-100">
          <div className="text-sm font-semibold mb-1">Tip</div>
          <div className="text-sm leading-relaxed">{tip}</div>
        </div>

        {/* Tiêu đề & mô tả */}
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Harvest schedule</h2>
        <p className="text-blue-100/80 text-sm leading-relaxed mt-3">
          Ask a question of the support question, Manage request, report an issues.
        </p>

        {/* Danh sách lịch */}
        <div className="space-y-6">
          {harvestData.map((item, idx) => (
            <div key={idx} className={`pt-6 ${idx > 0 ? "border-t border-white/10" : ""}`}>
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 rounded-2xl object-cover ring-1 ring-white/10"
                  onError={(e) => { e.currentTarget.src = headerImage; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg truncate">{item.title}</div>
                  <div className="mt-2 flex items-center gap-6 text-blue-100/80 text-sm">
                    <span className="inline-flex items-center gap-2"><FaRegCalendarAlt /> {item.date}</span>
                    <span className="inline-flex items-center gap-2"><FaRegClock /> {item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
