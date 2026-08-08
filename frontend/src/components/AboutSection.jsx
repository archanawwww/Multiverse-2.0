import React from 'react';
import { motion } from 'framer-motion';
import { Award, Disc, Headphones, Star } from 'lucide-react';

const AboutSection = ({ artist }) => {
  const { stats, about } = artist;

  const statItems = [
    { icon: <Disc className="text-primary" />, label: 'Albums', value: stats.albums },
    { icon: <Star className="text-secondary" />, label: 'Songs', value: stats.songs },
    { icon: <Headphones className="text-accent" />, label: 'Streams', value: stats.streams },
    { icon: <Award className="text-primary" />, label: 'Awards', value: stats.awards },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white border-b-2 border-primary inline-block pb-2">
            The Journey
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            {artist.shortBiography}
          </p>
          <div className="space-y-4 text-gray-400">
            <p><strong className="text-white">Nationality:</strong> {about.nationality}</p>
            <p><strong className="text-white">Years Active:</strong> {about.yearsActive}</p>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {statItems.map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] flex flex-col items-center text-center"
            >
              <div className="mb-4 bg-white/5 p-4 rounded-full shadow-inner">{stat.icon}</div>
              <h4 className="text-3xl font-bold text-white mb-2">{stat.value}</h4>
              <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
        
      </div>

      {/* Timeline */}
      <motion.div 
        className="mt-24"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-heading font-bold mb-10 text-center">Career Timeline</h3>
        <div className="space-y-8 max-w-3xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary before:to-transparent">
          {about.timeline.map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between space-x-2 mb-3">
                  <div className="font-bold text-accent text-lg px-3 py-1 bg-white/5 rounded-full">{item.year}</div>
                </div>
                <div className="text-gray-300">{item.event}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
