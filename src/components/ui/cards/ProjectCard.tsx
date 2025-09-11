// src/components/ui/cards/ProjectCard.tsx
import { Media } from '@/types/AniListResponse';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectCardProps {
    project: Media;
}

const UsersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const LayersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <Link href={`/media/${project.id}`}>
            <div className="bg-[#2a2d42] rounded-lg p-3 group transition-all hover:scale-105 hover:bg-[#3a3d58]">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image src={project.coverImage.large} alt={project.title.romaji} fill style={{ objectFit: 'cover' }} sizes="64px" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-bold text-white group-hover:text-[#ffbade] transition-colors">{project.title.romaji}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5" title="Capítulos">
                                <LayersIcon />
                                <span>{project.chapters || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Colaboradores">
                                <UsersIcon />
                                <span>{project.collaboratorsCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;