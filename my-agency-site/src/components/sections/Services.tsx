import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

export default function Services() {
  return (
    // 1. Reduced vertical padding (py-16 instead of py-24)
    <section id="services" className="relative py-16 px-6 scroll-mt-20 overflow-hidden bg-[#0f172a]">
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-10"> {/* Reduced margin-bottom */}
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Our Services
          </h2>
          <p className="text-slate-400 mt-2 text-sm"> {/* Smaller margin and text */}
            Powerful solutions tailored to your business needs.
          </p>
        </div>
        
        {/* 2. Smaller gap (gap-4) and more compact rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <div
              key={i}
              className={cn(
                "group relative flex flex-col justify-start overflow-hidden rounded-xl p-6 transition-all duration-300",
                "bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 shadow-lg",
                "h-[250px]" // 3. Significantly smaller fixed height
              )}
            >
              <div className="text-2xl mb-3 block">{service.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}