import Image from "next/image";
import { projects } from "@/lib/projects";
import { Button } from "@/components/ui/button";

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 px-6 bg-slate-50/50 scroll-mt-20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Recent Work</h2>
            <p className="text-slate-600 mt-2">Selected projects that showcase our expertise.</p>
          </div>
          <Button variant="outline">View All Projects</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md">
              {/* Image Container */}
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-slate-100 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{project.description}</p>
                <Button variant="link" className="p-0 h-auto font-semibold">
                  View Case Study →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}